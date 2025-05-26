import { useState } from "react";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Settings, Eye, EyeOff, Key, Save, TestTube } from "lucide-react";
import { api } from "@/lib/api";

const settingsSchema = z.object({
  openaiApiKey: z.string().min(1, "OpenAI API key is required").startsWith("sk-", "Invalid API key format"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = { openaiApiKey: "" }, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: api.getSettings,
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      openaiApiKey: "",
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings.openaiApiKey) {
      form.setValue("openaiApiKey", settings.openaiApiKey);
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: SettingsFormData) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your OpenAI API key has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const testApiKeyMutation = useMutation({
    mutationFn: () => api.testOpenAIConnection(),
    onSuccess: (data: any) => {
      toast({
        title: "Connection Successful",
        description: `OpenAI API is working correctly. Model: ${data.model}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to OpenAI API. Please check your API key.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  const handleTestConnection = () => {
    const apiKey = form.getValues("openaiApiKey");
    if (!apiKey) {
      toast({
        title: "No API Key",
        description: "Please enter an OpenAI API key first.",
        variant: "destructive",
      });
      return;
    }
    testApiKeyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Admin Settings" 
          subtitle="Configure system settings and API keys" 
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border border-gray-200">
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Admin Settings" 
        subtitle="Configure system settings and API keys" 
      />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* OpenAI API Configuration */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Key className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark">OpenAI API Configuration</h2>
                  <p className="text-sm text-light">Configure your OpenAI API key for AI-powered features</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="openaiApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OpenAI API Key</FormLabel>
                        <FormDescription>
                          Your OpenAI API key enables AI recommendations, infrastructure analysis, and optimization suggestions.
                        </FormDescription>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showApiKey ? "text" : "password"}
                              placeholder="sk-..."
                              {...field}
                              className="pr-10"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                        <div className="text-xs text-light">
                          Get your API key from{" "}
                          <a 
                            href="https://platform.openai.com/account/api-keys" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            platform.openai.com
                          </a>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-3">
                    <Button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                      className="bg-primary hover:bg-secondary text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testApiKeyMutation.isPending}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      {testApiKeyMutation.isPending ? "Testing..." : "Test Connection"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Settings className="text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark">System Information</h2>
                  <p className="text-sm text-light">CloudAI Stack platform details</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-light">Platform</Label>
                  <p className="text-sm text-dark font-medium">CloudAI Stack</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-light">Version</Label>
                  <p className="text-sm text-dark font-medium">1.0.0</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-light">Database</Label>
                  <p className="text-sm text-dark font-medium">PostgreSQL</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-light">AI Features</Label>
                  <p className="text-sm text-dark font-medium">
                    {settings.openaiApiKey ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}