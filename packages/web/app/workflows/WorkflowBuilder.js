'use client';

import { useState, useEffect } from 'react';
import YAML from 'yaml';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { ActionParamInput } from './ActionParamInput';

export default function WorkflowBuilder() {

  const [actions, setActions] = useState([]);
  const [workflows, setWorkflows] = useState({});
  const [workflowName, setWorkflowName] = useState('');
  const [workflowActions, setWorkflowActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionParams, setActionParams] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  useEffect(() => {
    // Fetch available actions from server
    fetch('http://localhost:3001/actions')
      .then(res => res.json())
      .then(data => setActions(data.actions))
      .catch(err => console.error('Error fetching actions:', err));

    // Fetch existing workflows
    fetch('http://localhost:3001/workflows')
      .then(res => res.json())
      .then(data => setWorkflows(data))
      .catch(err => console.error('Error fetching workflows:', err));
  }, []);

  const handleWorkflowSelect = (workflowName) => {
    if (workflowName) {
      const workflow = workflows[workflowName];
      if (workflow) {
        setSelectedWorkflow(workflowName);
        setWorkflowName(workflowName);
        setWorkflowActions(workflow.actions);
      }
    } else {
      setSelectedWorkflow(null);
      setWorkflowName('');
      setWorkflowActions([]);
    }
  };

  const handleAddAction = () => {
    if (selectedAction) {
      const newAction = {
        [selectedAction]: actionParams
      };
      
      if (editingIndex !== null) {
        // Update existing action
        const updatedActions = [...workflowActions];
        updatedActions[editingIndex] = newAction;
        setWorkflowActions(updatedActions);
        setEditingIndex(null);
      } else {
        // Add new action
        setWorkflowActions([...workflowActions, newAction]);
      }

      setSelectedAction(null);
      setActionParams({});
    }
  };

  const handleEditAction = (index) => {
    const action = workflowActions[index];
    const actionType = Object.keys(action)[0];
    setSelectedAction(actionType);
    setActionParams(action[actionType]);
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setSelectedAction(null);
    setActionParams({});
    setEditingIndex(null);
  };

  const handleDeleteAction = (index) => {
    setWorkflowActions(workflowActions.filter((_, i) => i !== index));
  };

  const handleParamChange = (paramName, value) => {
    setActionParams({
      ...actionParams,
      [paramName]: value
    });
  };

  const handleSave = async () => {
    try {
      const workflow = {
        [workflowName]: {
          actions: workflowActions
        }
      };
      const yamlText = YAML.stringify(workflow);
      const url = 'http://localhost:3001/workflows';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/yaml' },
        body: yamlText
      });
      
      if (!res.ok) throw new Error('Error saving workflow');
      alert('✅ Workflow saved successfully');
      
      // Refresh workflows list
      const workflowsRes = await fetch('http://localhost:3001/workflows');
      const workflowsData = await workflowsRes.json();
      setWorkflows(workflowsData);
      
      setShowPreview(false);
    } catch (err) {
      console.error('Error saving workflow:', err);
      alert('❌ Error saving workflow');
    }
  };

  const getActionConfig = (actionName) => {
    return actions.find(a => a.name === actionName);
  };

  const getYamlPreview = () => {
    const workflow = {
      [workflowName]: {
        actions: workflowActions
      }
    };
    return YAML.stringify(workflow);
  };

  return (
    <div className="w-full max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!showPreview ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="workflowSelect">Select Existing Workflow</Label>
                  <select
                    id="workflowSelect"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedWorkflow || ''}
                    onChange={(e) => handleWorkflowSelect(e.target.value)}
                  >
                    <option value="">Create New Workflow</option>
                    {Object.keys(workflows).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workflowName">Workflow Name</Label>
                  <Input
                    id="workflowName"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="e.g., register, notify, etc."
                    disabled={selectedWorkflow !== null}
                  />
                </div>

                <div className="flex gap-4">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedAction || ''}
                    onChange={(e) => setSelectedAction(e.target.value)}
                  >
                    <option value="">Select an action</option>
                    {actions.map((action) => (
                      <option key={action.name} value={action.name}>
                        {action.description}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAddAction}>Add Action</Button>
                </div>

                {selectedAction && (
                  <div className="space-y-4 p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getActionConfig(selectedAction)?.icon && (
                          <Image
                            src={`http://localhost:3001/icons/${getActionConfig(selectedAction)?.icon.split('/').pop()}`}
                            alt={selectedAction}
                            width={24}
                            height={24}
                            className="rounded-sm"
                          />
                        )}
                        <h3 className="font-semibold">
                          {editingIndex !== null ? 'Edit' : 'Configure'} {selectedAction}
                        </h3>
                      </div>
                      {editingIndex !== null && (
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                    {getActionConfig(selectedAction)?.parameters.map((param) => (
                      <div key={ param.name } className="space-y-2">
                        <Label htmlFor={ param.name }>{ param.description }</Label>
                        <ActionParamInput 
                          param={ param } 
                          value={ actionParams[param.name] } 
                          onChange={ handleParamChange }
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Accordion type="single" collapsible className="w-full">
                  {workflowActions.map((action, index) => {
                    const actionType = Object.keys(action)[0];
                    const actionConfig = getActionConfig(actionType);
                    return (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <div className="flex items-center justify-between">
                          <AccordionTrigger>
                            {actionType} - {index + 1}
                          </AccordionTrigger>
                          <div className="flex items-center gap-2">
                            {actionConfig?.icon && (
                              <Image 
                                src={`http://localhost:3001/icons/${actionConfig?.icon.split('/').pop()}`}
                                alt={actionType}
                                width={20}
                                height={20}
                                className="rounded-sm"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditAction(index)}
                              className="mr-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                <path d="m15 5 4 4"/>
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAction(index)}
                              className="mr-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <AccordionContent>
                          <pre className="text-sm">
                            {JSON.stringify(action[actionType], null, 2)}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>

                {workflowName && workflowActions.length > 0 && (
                  <Button onClick={() => setShowPreview(true)} className="w-full">
                    Preview & Save
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Workflow Preview</h3>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Back to Edit
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={getYamlPreview()}
                  className="font-mono h-[300px]"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    Save Workflow
                  </Button>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}