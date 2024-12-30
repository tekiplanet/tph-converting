import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { quoteService } from '@/services/quoteService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, FileText, MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'react-hot-toast';
import Pusher from 'pusher-js';

interface Quote {
  id: string;
  service: {
    name: string;
  };
  industry: string;
  budget_range: string;
  contact_method: string;
  project_description: string;
  project_deadline: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  messages: Array<{
    id: string;
    message: string;
    sender_type: 'user' | 'admin';
    created_at: string;
    user: {
      first_name: string;
      last_name: string;
      avatar: string;
    };
  }>;
  unread_messages_count: number;
  quote_fields: {
    [key: string]: string | number | boolean;
  } | null;
}

function QuoteDetails() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      try {
        const data = await quoteService.getQuoteDetails(quoteId);
        console.log('Quote data:', data.quote);
        console.log('Quote fields:', data.quote.quote_fields);
        setQuote(data.quote);
      } catch (error) {
        console.error('Failed to fetch quote details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      fetchQuoteDetails();
    }
  }, [quoteId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await quoteService.sendMessage(quoteId!, newMessage);
      if (response.success) {
        setQuote(prev => ({
          ...prev!,
          messages: [...prev!.messages, response.message]
        }));
        setNewMessage('');
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!quoteId) return;

    // Initialize Pusher
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      encrypted: true
    });

    // Subscribe to the quote channel
    const channel = pusher.subscribe(`quote.${quoteId}`);
    
    // Listen for new messages
    channel.bind('new-message', (data: { message: Quote['messages'][0] }) => {
      setQuote(prev => ({
        ...prev!,
        messages: [...prev!.messages, data.message]
      }));
      scrollToBottom();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [quoteId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [quote?.messages]);

  const markMessagesAsRead = async () => {
    try {
      await quoteService.markMessagesAsRead(quoteId!);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  useEffect(() => {
    if (quote?.unread_messages_count > 0) {
      markMessagesAsRead();
    }
  }, [quote?.unread_messages_count]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote) {
    return <div>Quote not found</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{quote.service.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(quote.status)}>
            {quote.status.toUpperCase()}
          </Badge>
          <span className="text-muted-foreground">
            Submitted on {format(new Date(quote.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">
            <Info className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="description">
            <FileText className="h-4 w-4 mr-2" />
            Description
          </TabsTrigger>
          <TabsTrigger value="conversation" className="relative">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
            {quote.unread_messages_count > 0 && (
              <div className="absolute -top-2 -right-2">
                <div className="relative flex items-center justify-center">
                  <span className="absolute h-3 w-3 rounded-full bg-destructive animate-fade-pulse" />
                  <Badge 
                    variant="destructive" 
                    className="relative h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {quote.unread_messages_count}
                  </Badge>
                </div>
              </div>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-6 p-6">
              {/* Standard Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2 text-muted-foreground">Industry</h3>
                  <p className="break-words">{quote.industry}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-muted-foreground">Budget Range</h3>
                  <p className="break-words">{quote.budget_range}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-muted-foreground">Contact Method</h3>
                  <p className="break-words">{quote.contact_method}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2 text-muted-foreground">Project Deadline</h3>
                  <p className="break-words">{format(new Date(quote.project_deadline), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {/* Dynamic Quote Fields */}
              {quote.quote_fields && Object.keys(quote.quote_fields).length > 0 && (
                <>
                  <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(quote.quote_fields).map(([title, value]) => (
                        <div key={title}>
                          <h3 className="font-medium mb-2 text-muted-foreground">
                            {title}
                          </h3>
                          <p className="break-words">
                            {typeof value === 'boolean' 
                              ? (value ? 'Yes' : 'No')
                              : String(value)
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="description">
          <Card>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap">{quote.project_description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversation">
          <Card className="h-[calc(100vh-16rem)] flex flex-col">
            <CardHeader className="border-b px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Conversation</h3>
                </div>
                {quote.messages.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {quote.messages.length} messages
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 scroll-smooth">
                  {quote.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                      <div className="bg-muted/50 p-4 rounded-full mb-3">
                        <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-medium mb-1">
                        No messages yet
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        Start the conversation by sending a message below
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quote.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 ${
                            message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender_type === 'admin' && (
                            <div className="flex-shrink-0 mb-1">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  SA
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div
                            className={`group relative max-w-[85%] sm:max-w-[75%] break-words ${
                              message.sender_type === 'user'
                                ? 'bg-primary text-primary-foreground rounded-[1.25rem] rounded-tr-md'
                                : 'bg-muted rounded-[1.25rem] rounded-tl-md'
                            }`}
                          >
                            <div className="px-4 py-2.5">
                              {message.sender_type === 'admin' && (
                                <p className="text-xs font-medium mb-1 text-muted-foreground">
                                  Support Agent
                                </p>
                              )}
                              <p className="text-sm leading-relaxed">{message.message}</p>
                            </div>
                            <span 
                              className={`absolute bottom-0 translate-y-full left-0 text-[10px] pt-1 opacity-0 group-hover:opacity-70 transition-opacity ${
                                message.sender_type === 'user' 
                                  ? 'text-muted-foreground/70' 
                                  : 'text-muted-foreground/70'
                              }`}
                            >
                              {format(new Date(message.created_at), 'h:mm a')}
                            </span>
                          </div>

                          {message.sender_type === 'user' && (
                            <div className="flex-shrink-0 mb-1">
                              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-xs font-medium text-primary-foreground">
                                  {message.user.first_name.charAt(0)}
                                  {message.user.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input - Updated with conditional rendering */}
                <div className="flex-shrink-0 p-4 bg-background/80 backdrop-blur-sm border-t">
                  {quote.status === 'accepted' || quote.status === 'rejected' ? (
                    <div className="max-w-4xl mx-auto">
                      <div className="bg-muted/50 rounded-full px-4 py-3 flex items-center justify-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {quote.status === 'accepted' 
                            ? "This quote has been accepted. New messages are disabled."
                            : "This quote has been rejected. New messages are disabled."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative max-w-4xl mx-auto">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="pr-12 py-6 rounded-full border-muted-foreground/20 bg-background shadow-sm"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'reviewed':
      return 'outline';
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default QuoteDetails;
