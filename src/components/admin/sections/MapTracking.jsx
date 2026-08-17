import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Truck } from 'lucide-react';

// Define custom HTML markers using L.divIcon
const createCustomIcon = (emoji, bgColor) => {
  return new L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background: ${bgColor}; color: white; padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 16px;">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const workerIcon = createCustomIcon('🚛', '#3b82f6');
const completedReportIcon = createCustomIcon('📍', '#10b981');
const pendingReportIcon = createCustomIcon('📍', '#f59e0b');
const collectionPointIcon = createCustomIcon('🏢', '#8b5cf6');

export default function MapTracking() {
  const [workers, setWorkers] = useState([]);
  const [reports, setReports] = useState([]);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersData, reportsData, pointsData] = await Promise.all([
        fetchApi('/admin/workers'),
        fetchApi('/admin/reports'),
        fetchApi('/admin/collection-points')
      ]);

      setWorkers(workersData || []);
      setReports(reportsData || []);
      setCollectionPoints(pointsData || []);
    } catch (error) {
      console.error('Error fetching map data:', error);
      toast.error('Failed to load map data');
    }
  };

  const filteredWorkers = selectedWorker === 'all' 
    ? workers 
    : workers.filter(w => w.id === selectedWorker);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map & Real-Time Tracking
          </CardTitle>
          <CardDescription>Track workers, reports, and collection points in real-time instantly without any API keys!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by worker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workers</SelectItem>
                {workers.map(worker => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.full_name || worker.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchData}>
              Refresh Map
            </Button>
          </div>
          
          <div className="w-full h-[600px] rounded-lg border overflow-hidden relative z-0">
            <MapContainer 
              center={[20.5937, 78.9629]} 
              zoom={5} 
              style={{ width: '100%', height: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Worker Markers */}
              {filteredWorkers.map(worker => (
                worker.current_location_lat && worker.current_location_lng && (
                  <Marker 
                    key={`worker-${worker.id}`}
                    position={[worker.current_location_lat, worker.current_location_lng]}
                    icon={workerIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{worker.full_name || 'Worker'}</strong><br />
                        <span className="text-gray-500">Vehicle: {worker.vehicle_id || 'N/A'}</span>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}

              {/* Report Markers */}
              {reports.map(report => (
                report.location_lat && report.location_lng && (
                  <Marker 
                    key={`report-${report.id}`}
                    position={[report.location_lat, report.location_lng]}
                    icon={report.status === 'completed' ? completedReportIcon : pendingReportIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{report.title}</strong><br />
                        <span className="text-gray-500">Status: {report.status}</span>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}

              {/* Collection Point Markers */}
              {collectionPoints.map(point => (
                point.location_lat && point.location_lng && (
                  <Marker 
                    key={`point-${point.id}`}
                    position={[point.location_lat, point.location_lng]}
                    icon={collectionPointIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{point.name}</strong><br />
                        <span className="text-gray-500">{point.address}</span><br />
                        <span className="text-gray-500">Capacity: {point.current_load}/{point.capacity}kg</span>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg">
              <Truck className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Workers</div>
                <div className="text-xs text-muted-foreground">{workers.length} active</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg">
              <MapPin className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-sm font-medium">Reports</div>
                <div className="text-xs text-muted-foreground">{reports.length} total</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Collection Points</div>
                <div className="text-xs text-muted-foreground">{collectionPoints.length} locations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
