import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar, DollarSign } from "lucide-react";
import { useCreateMarket } from "@/hooks/useCreateMarket";
import { useCurrentWallet } from '@mysten/dapp-kit';

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (marketId: string) => void;
}

export function CreateMarketModal({ isOpen, onClose, onSuccess }: CreateMarketModalProps) {
  const { isConnected } = useCurrentWallet();
  const { createMarket, isLoading, error } = useCreateMarket();
  
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    end_time: "",
    category: "",
    image_url: "",
    tags: [] as string[],
    initial_liquidity: ""
  });
  const [newTag, setNewTag] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const marketId = await createMarket({
        question: formData.question,
        description: formData.description,
        endTime: new Date(formData.end_time),
        category: formData.category,
        imageUrl: formData.image_url,
        tags: formData.tags,
        initialLiquiditySui: parseFloat(formData.initial_liquidity)
      });

      if (marketId) {
        onSuccess?.(marketId);
        onClose();
        
        // Reset form
        setFormData({
          question: "",
          description: "",
          end_time: "",
          category: "",
          image_url: "",
          tags: [],
          initial_liquidity: ""
        });
      }
    } catch (err) {
      console.error("Failed to create market:", err);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 min-h-screen">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto my-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gradient-gold font-orbitron">
              Create New Market
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-medium">
                Market Question *
              </Label>
              <Input
                id="question"
                placeholder="e.g., Will Bitcoin hit $100K by end of 2024?"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                required
                className="bg-muted/30 border-border/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Provide context and details about this market..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
                className="bg-muted/30 border-border/50"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Politics">Politics</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Economics">Economics</SelectItem>
                  <SelectItem value="Space">Space</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-sm font-medium">
                Market End Date *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  required
                  className="pl-10 bg-muted/30 border-border/50"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="text-sm font-medium">
                Market Image URL
              </Label>
              <Input
                id="image_url"
                placeholder="https://images.unsplash.com/photo-1234567890/example.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="bg-muted/30 border-border/50"
              />
              <p className="text-xs text-muted-foreground">
                Use a public image URL (e.g., Unsplash, Imgur, or your own hosting)
              </p>
              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg border border-border/50"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="bg-muted/30 border-border/50"
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  size="sm" 
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Initial Liquidity */}
            <div className="space-y-2">
              <Label htmlFor="initial_liquidity" className="text-sm font-medium">
                Initial Liquidity (SUI) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="initial_liquidity"
                  type="number"
                  placeholder="10"
                  value={formData.initial_liquidity}
                  onChange={(e) => setFormData(prev => ({ ...prev, initial_liquidity: e.target.value }))}
                  required
                  min="1"
                  step="0.1"
                  className="pl-10 bg-muted/30 border-border/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 1 SUI. This provides initial liquidity and will be split equally between YES and NO outcomes.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-market-gold flex-1 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading || !isConnected}
              >
                {isLoading ? "Creating..." : "Create Market"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
