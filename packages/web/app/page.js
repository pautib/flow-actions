import Image from "next/image";
import WorkflowBuilder from "./workflows/WorkflowBuilder";
import WorkflowExecutor from "./workflows/WorkflowExecutor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
            <TabsTrigger value="executor">Workflow Executor</TabsTrigger>
          </TabsList>
          <TabsContent value="builder">
            <WorkflowBuilder />
          </TabsContent>
          <TabsContent value="executor">
            <WorkflowExecutor />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
