import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Lightbulb, Shield, TrendingUp, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AiRecommendation } from "@/types";

export function AIRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading } = useQuery<AiRecommendation[]>({
    queryKey: ["/api/ai/recommendations"],
    queryFn: api.getRecommendations,
    refetchInterval: 60000, // Refresh every minute
  });

  const updateRecommendationMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateRecommendation(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/recommendations"] });
      toast({
        title: "Recommendation updated",
        description: "The recommendation status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update recommendation status.",
        variant: "destructive",
      });
    },
  });

  const analyzeInfrastructureMutation = useMutation({
    mutationFn: api.analyzeInfrastructure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/recommendations"] });
      toast({
        title: "Analysis Complete",
        description: "Infrastructure analysis completed. New recommendations may be available.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze infrastructure. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return Lightbulb;
      case "security":
        return Shield;
      case "capacity":
        return TrendingUp;
      default:
        return Lightbulb;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "optimization":
        return "warning";
      case "security":
        return "primary";
      case "capacity":
        return "success";
      default:
        return "warning";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <Skeleton className="h-5 w-64 mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-dark">AI Recommendations</h2>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Live Analysis
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => analyzeInfrastructureMutation.mutate()}
              disabled={analyzeInfrastructureMutation.isPending}
            >
              {analyzeInfrastructureMutation.isPending ? "Analyzing..." : "Run Analysis"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No recommendations available</p>
            <Button
              variant="outline"
              onClick={() => analyzeInfrastructureMutation.mutate()}
              disabled={analyzeInfrastructureMutation.isPending}
            >
              Generate Recommendations
            </Button>
          </div>
        ) : (
          recommendations.slice(0, 3).map((recommendation) => {
            const Icon = getRecommendationIcon(recommendation.type);
            const colorScheme = getRecommendationColor(recommendation.type);
            
            return (
              <div
                key={recommendation.id}
                className={`flex items-start space-x-4 p-4 border rounded-lg ${
                  colorScheme === "warning" ? "bg-amber-50 border-amber-200" :
                  colorScheme === "primary" ? "bg-blue-50 border-blue-200" :
                  "bg-green-50 border-green-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  colorScheme === "warning" ? "bg-warning/20" :
                  colorScheme === "primary" ? "bg-primary/20" :
                  "bg-success/20"
                }`}>
                  <Icon className={`text-sm ${
                    colorScheme === "warning" ? "text-warning" :
                    colorScheme === "primary" ? "text-primary" :
                    "text-success"
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-dark">{recommendation.title}</h3>
                  <p className="text-sm text-light mt-1">{recommendation.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => updateRecommendationMutation.mutate({
                        id: recommendation.id,
                        status: "applied"
                      })}
                      disabled={updateRecommendationMutation.isPending}
                      className="text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Apply Suggestion
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateRecommendationMutation.mutate({
                        id: recommendation.id,
                        status: "dismissed"
                      })}
                      disabled={updateRecommendationMutation.isPending}
                      className="text-sm text-light hover:text-dark"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Dismiss
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(recommendation.priority) as any}>
                        {recommendation.priority}
                      </Badge>
                      <span className="text-xs text-light">
                        Confidence: {Math.round(recommendation.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
