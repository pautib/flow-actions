'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function WorkflowExecutor() {
  const [workflows, setWorkflows] = useState({});
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [requestBody, setRequestBody] = useState('{}');
  const [isExecuting, setIsExecuting] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch existing workflows
    fetch('http://localhost:3001/workflows')
      .then(res => res.json())
      .then(data => setWorkflows(data))
      .catch(err => {
        console.error('Error fetching workflows:', err);
        setError('Failed to load workflows');
      });
  }, []);

  const handleExecute = async () => {
    if (!selectedWorkflow) {
      setError('Please select a workflow');
      return;
    }

    try {
      setIsExecuting(true);
      setError(null);
      setResponse(null);

      // Parse the JSON body to validate it
      const parsedBody = JSON.parse(requestBody);

      const res = await fetch(`http://localhost:3001/workflows/${selectedWorkflow}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedBody),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute workflow');
      }

      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Executor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflowSelect">Select Workflow</Label>
              <select
                id="workflowSelect"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedWorkflow}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
              >
                <option value="">Select a workflow</option>
                {Object.keys(workflows).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestBody">Request Body (JSON)</Label>
              <Textarea
                id="requestBody"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="font-mono h-[200px]"
                placeholder="Enter JSON request body"
              />
            </div>

            <Button 
              onClick={handleExecute} 
              disabled={isExecuting || !selectedWorkflow}
              className="w-full"
            >
              {isExecuting ? 'Executing...' : 'Execute Workflow'}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {response && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {response.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 