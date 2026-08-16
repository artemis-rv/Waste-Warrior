import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, MapPin, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';

export default function ReportForm({ onReportSubmitted }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address_text: '',
    location_lat: null,
    location_lng: null
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const { t } = useTranslation();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.error') || 'Invalid file type',
          description: `${file.name} ${t('reportForm.invalidFile') || 'is not an image file'}`,
          variant: "destructive"
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: t('common.error') || 'File too large',
          description: `${file.name} ${t('reportForm.fileTooLarge') || 'exceeds 5MB limit'}`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (selectedFiles.length + validFiles.length > 3) {
      toast({
        title: t('common.error') || 'Too many files',
        description: t('reportForm.maxFiles') || 'Maximum 3 images allowed per report',
        variant: "destructive"
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: t('common.error') || 'Location not supported',
        description: t('reportForm.locationNotSupported') || "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location_lat: position.coords.latitude,
          location_lng: position.coords.longitude
        }));
        toast({
          title: t('reportForm.locationCaptured') || 'Location captured',
          description: t('reportForm.locationCapturedDesc') || 'Current location has been added to your report'
        });
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Could not get your current location",
          variant: "destructive"
        });
      }
    );
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    if (formData.address_text) data.append('addressText', formData.address_text.trim());
    if (formData.location_lat) data.append('locationLat', formData.location_lat);
    if (formData.location_lng) data.append('locationLng', formData.location_lng);
    
    selectedFiles.forEach((file) => {
      data.append('images', file);
    });
    
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      setUploadingImages(true);
      const submitData = buildFormData();

      // Submit report to Express REST API
      const res = await fetchApi('/resident/reports', {
        method: 'POST',
        body: submitData
      });

      toast({
        title: t('reportForm.submittedTitle') || 'Report submitted!',
        description: t('reportForm.submittedDesc') || 'Thank you for reporting waste. You earned 10 credits!'
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        address_text: '',
        location_lat: null,
        location_lng: null
      });
      setSelectedFiles([]);
      setPreviewUrls([]);

      if (onReportSubmitted) onReportSubmitted();

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: t('common.error') || 'Error',
        description: error.message || t('reportForm.submitError') || "Failed to submit report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          {t('reportForm.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('reportForm.issueTitle') || 'Issue Title *'}</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={t('reportForm.titlePlaceholder') || 'e.g., Overflowing garbage bin on Main Street'}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('reportForm.description') || 'Description *'}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('reportForm.descPlaceholder') || 'Please describe the waste issue in detail...'}
              rows={3}
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address_text">{t('reportForm.addressLabel') || 'Address / Location'}</Label>
            <div className="flex gap-2">
              <Input
                id="address_text"
                name="address_text"
                value={formData.address_text}
                onChange={handleInputChange}
                placeholder={t('reportForm.addressPlaceholder') || 'Enter address or location details'}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="px-3"
                title={t('reportForm.getCurrentLocation') || 'Get current GPS location'}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {formData.location_lat && formData.location_lng && (
              <p className="text-sm text-muted-foreground">
                {t('reportForm.locationCaptured')}: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photos">{t('reportForm.photosLabel') || 'Photos (up to 3)'}</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4">
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="photos"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t('reportForm.uploadHint') || 'Click to upload photos or drag and drop'}
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || uploadingImages}
          >
            {loading || uploadingImages ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadingImages ? t('reportForm.uploading') || 'Uploading images...' : t('reportForm.submitting') || 'Submitting report...'}
              </>
            ) : (
              t('reportForm.submit') || 'Submit Report'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
