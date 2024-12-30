import React, { useState, useEffect } from 'react';

const DebugLogger = () => {
//   const [logs, setLogs] = useState<string[]>([]);

//   useEffect(() => {
//     const originalConsoleLog = console.log;
//     const originalConsoleError = console.error;

//     console.log = (...args) => {
//       originalConsoleLog.apply(console, args);
//       setLogs(prev => [...prev, `LOG: ${args.join(' ')}`]);
//     };

//     console.error = (...args) => {
//       originalConsoleError.apply(console, args);
//       setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
//     };

//     return () => {
//       console.log = originalConsoleLog;
//       console.error = originalConsoleError;
//     };
//   }, []);

//   return (
//     <div 
//       style={{ 
//         position: 'fixed', 
//         bottom: 0, 
//         left: 0, 
//         right: 0,
//         maxHeight: '200px',
//         overflow: 'auto',
//         background: 'rgba(0,0,0,0.8)',
//         color: 'white',
//         padding: '10px',
//         fontSize: '12px',
//         zIndex: 9999
//       }}
//     >
//       {logs.map((log, i) => (
//         <div key={i}>{log}</div>
//       ))}
//     </div>
//   );
};

export default DebugLogger; 