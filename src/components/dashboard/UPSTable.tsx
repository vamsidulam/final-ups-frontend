import { Eye, MapPin, Clock, Loader2, Thermometer, Zap, Gauge, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UPS } from './types';

interface UPSTableProps {
  data: UPS[];
  onViewDetails: (ups: UPS) => void;
  isLoading?: boolean;
}

export function UPSTable({ data, onViewDetails, isLoading = false }: UPSTableProps) {
  const getStatusColor = (status: UPS['status']) => {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'warning':
        return 'status-warning';
      case 'failed':
        return 'status-failed';
      case 'risky':
        return 'status-risky';
      default:
        return '';
    }
  };

  const getStatusText = (status: UPS['status']) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'failed':
        return 'Failed';
      case 'risky':
        return 'Risky';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-card">
      <div className="p-3 sm:p-4 md:p-6 border-b border-border">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">UPS Systems Overview</h2>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Real-time status of all UPS units</p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">UPS ID / Name</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="hidden md:table-cell">Temperature</TableHead>
              <TableHead className="hidden lg:table-cell">Load</TableHead>
              <TableHead className="hidden lg:table-cell">Efficiency</TableHead>
              <TableHead className="min-w-[80px]">Battery</TableHead>
              <TableHead className="hidden md:table-cell">Failure Risk</TableHead>
              <TableHead className="min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 sm:py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm sm:text-base">Loading UPS data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 sm:py-8">
                  <span className="text-muted-foreground text-sm sm:text-base">No UPS systems found</span>
                </TableCell>
              </TableRow>
            ) : (
              data.map((ups) => (
                <TableRow key={ups.upsId} className="hover:bg-muted/50 transition-colors">
                  {/* UPS ID / Name - Always visible */}
                  <TableCell className="p-2 sm:p-4">
                    <div>
                      <div className="font-medium text-foreground text-sm sm:text-base">{ups.upsId}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-none">{ups.name}</div>
                      {/* Show location on mobile since it's hidden */}
                      <div className="sm:hidden flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{ups.location}</span>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Location - Hidden on mobile */}
                  <TableCell className="hidden sm:table-cell p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{ups.location}</span>
                    </div>
                  </TableCell>
                  
                  {/* Status - Always visible */}
                  <TableCell className="p-2 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`status-indicator ${getStatusColor(ups.status)}`}></div>
                      <span className={`font-medium text-xs sm:text-sm ${
                        ups.status === 'healthy' ? 'text-success' :
                        ups.status === 'warning' ? 'text-warning' :
                        ups.status === 'risky' ? 'text-orange-600' :
                        'text-destructive'
                      }`}>
                        {getStatusText(ups.status)}
                      </span>
                    </div>
                  </TableCell>
                  
                  {/* Temperature - Hidden on mobile and small screens */}
                  <TableCell className="hidden md:table-cell p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm font-mono ${
                        (ups.temperature || 0) > 40 ? 'text-red-600' :
                        (ups.temperature || 0) > 35 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {ups.temperature || 0}°C
                      </span>
                    </div>
                  </TableCell>
                  
                  {/* Load - Hidden on mobile, small, and medium screens */}
                  <TableCell className="hidden lg:table-cell p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            (ups.load || 0) > 90 ? 'bg-red-500' :
                            (ups.load || 0) > 80 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${ups.load || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{ups.load || 0}%</span>
                    </div>
                  </TableCell>
                  
                  {/* Efficiency - Hidden on mobile, small, and medium screens */}
                  <TableCell className="hidden lg:table-cell p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-sm font-mono ${
                        (ups.efficiency || 0) < 80 ? 'text-red-600' :
                        (ups.efficiency || 0) < 85 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {ups.efficiency || 0}%
                      </span>
                    </div>
                  </TableCell>
                  
                  {/* Battery - Always visible */}
                  <TableCell className="p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 sm:w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            ups.batteryLevel > 70 ? 'bg-success' :
                            ups.batteryLevel > 30 ? 'bg-warning' :
                            'bg-destructive'
                          }`}
                          style={{ width: `${ups.batteryLevel}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-mono">{ups.batteryLevel}%</span>
                    </div>
                  </TableCell>
                  
                  {/* Failure Risk - Hidden on mobile and small screens */}
                  <TableCell className="hidden md:table-cell p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              (ups.failureRisk || 0) > 0.8 ? 'bg-red-500' :
                              (ups.failureRisk || 0) > 0.6 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${(ups.failureRisk || 0) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono ${
                          (ups.failureRisk || 0) > 0.8 ? 'text-red-600' :
                          (ups.failureRisk || 0) > 0.6 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {(ups.failureRisk || 0) * 100}%
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Actions - Always visible */}
                  <TableCell className="p-2 sm:p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(ups)}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
