import { PencilIcon } from "lucide-react"
import { ActionBarPrimitive, MessagePrimitive } from "@assistant-ui/react"
import { type FC } from "react"
import { UserMessageAttachments } from "@/components/thread/attachment"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"
import { BranchPicker } from "@/components/thread/components/AssistantMessage/components/branch-picker"

export const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div
        className="mx-auto flex !w-[calc(100vw/3)] flex-col gap-y-2 px-2 py-4 animate-in duration-150 ease-out fade-in slide-in-from-bottom-1 first:mt-3 last:mb-5"
        data-role="user"
      >
        <div className="aui-user-message-content-wrapper relative ml-auto flex min-w-0 max-w-[85%] flex-col items-end gap-2">
          <UserMessageAttachments />
          
          <div 
            className="aui-user-message-content border border-border rounded-xl bg-background !text-foreground px-5 py-2.5 break-words shadow-sm"
          >
            <MessagePrimitive.Parts />
          </div>
          
          <div className="aui-user-action-bar-wrapper absolute top-1/2 right-full -translate-y-1/2 pr-2">
            <UserActionBar />
          </div>
        </div>

        <BranchPicker className="aui-user-branch-picker ml-auto -mr-1 justify-end" />
      </div>
    </MessagePrimitive.Root>
  )
}

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  )
}

