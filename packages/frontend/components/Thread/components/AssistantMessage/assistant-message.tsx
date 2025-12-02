import { CheckIcon, CopyIcon, RefreshCwIcon } from "lucide-react"
import { ActionBarPrimitive, MessagePrimitive } from "@assistant-ui/react"
import { type FC } from "react"
import { MarkdownText } from "@/components/Thread/components/AssistantMessage/components/markdown-text"
import { ToolFallback } from "@/components/Thread/components/AssistantMessage/components/tool-fallback"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"
import { MessageError } from "@/components/Thread/components/AssistantMessage/components/message-error"
import { BranchPicker } from "@/components/Thread/components/AssistantMessage/components/branch-picker"
import { AgentActivityInline } from "@/components/Thread/components/AssistantMessage/components/agent-activity-inline"

export const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-assistant-message-root relative mx-auto !w-[calc(100vw/3)] animate-in py-4 duration-150 ease-out fade-in slide-in-from-bottom-1 last:mb-24"
        data-role="assistant"
      >
        {/* Agent activity timeline - always visible when there's data */}
        <AgentActivityInline />
        
        <div className="aui-assistant-message-content mx-2 leading-7 break-words text-foreground">
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownText,
              tools: { Fallback: ToolFallback },
            }}
          />
          <MessageError />
        </div>

        <div className="aui-assistant-message-footer mt-2 ml-2 flex">
          <BranchPicker />
          <AssistantActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  )
}

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  )
}

