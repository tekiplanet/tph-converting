import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  PlusCircle,
  Server,
  Calendar,
  BanknoteIcon
} from 'lucide-react';
import PagePreloader from '@/components/ui/PagePreloader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { projectService, type Project } from '@/services/projectService';
import { toast } from 'sonner';
import { EmptyPlaceholder } from "@/components/empty-placeholder";
import { cn } from '@/lib/utils';

export default function ProjectsListPage() {
  return <ProjectsList />;
}

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects();
        setProjects(data.projects);
        setFilteredProjects(data.projects);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setProjects([]);
          setFilteredProjects([]);
        } else {
          toast.error('Failed to fetch projects');
          console.error(error);
          setProjects([]);
          setFilteredProjects([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let result = projects;

    if (searchTerm) {
      result = result.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.business_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus && filterStatus !== 'all') {
      result = result.filter(project => project.status.toLowerCase() === filterStatus.toLowerCase());
    }

    setFilteredProjects(result);
  }, [searchTerm, filterStatus, projects]);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 -mx-4 px-4 py-3 mb-4 border-b">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold tracking-tight">Projects</h1>
              <Button
                onClick={() => navigate('/dashboard/services')}
                size="sm"
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">New Project</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[100px] h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <EmptyPlaceholder className="mx-auto max-w-[420px] mt-8">
              <EmptyPlaceholder.Icon>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                  <PlusCircle className="h-6 w-6 text-primary" />
                </div>
              </EmptyPlaceholder.Icon>
              <EmptyPlaceholder.Title>No projects found</EmptyPlaceholder.Title>
              <EmptyPlaceholder.Description>
                {projects.length === 0 
                  ? "You haven't created any projects yet. Get started by creating your first project."
                  : "No projects match your search criteria. Try adjusting your filters."}
              </EmptyPlaceholder.Description>
              {projects.length === 0 && (
                <Button 
                  onClick={() => navigate('/dashboard/services')}
                  className="mt-4"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Start New Project
                </Button>
              )}
            </EmptyPlaceholder>
          ) : (
            filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <Card className="hover:shadow-md transition-all hover:bg-accent/10">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Server className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h3 className="text-base font-semibold leading-none truncate">
                            {project.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.business_name}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem>Edit Project</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={getStatusVariant(project.status)} 
                        className="rounded-lg capitalize px-2.5 py-0.5 text-xs"
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <BanknoteIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{project.budget}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{project.start_date} - {project.end_date}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all", 
                              getStatusColor(project.status)
                            )}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
