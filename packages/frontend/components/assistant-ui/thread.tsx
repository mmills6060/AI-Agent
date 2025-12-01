import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  Square,
  BrainCircuit,
  Search,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";

import { useState, type FC } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import * as m from "motion/react-m";
import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { useAgentStore } from "@/lib/agent-store";

import { cn } from "@/lib/utils";

const agentConfig: Record<string, { icon: typeof BrainCircuit; color: string; bgColor: string; label: string }> = {
  orchestrator: { 
    icon: BrainCircuit, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Planning" 
  },
  researcher: { 
    icon: Search, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Researching" 
  },
  validator: { 
    icon: CheckCircle2, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Validating" 
  },
  synthesizer: { 
    icon: FileText, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Synthesizing" 
  },
  simple_response: { 
    icon: Sparkles, 
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    label: "Responding" 
  },
};

export const Thread: FC = () => {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <ThreadPrimitive.Root
          className="flex h-full flex-col bg-background"
          style={{
            ["--thread-max-width" as string]: "100%",
          }}
        >
          <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col overflow-x-auto overflow-y-sioll px-4">
            <ThreadPrimitive.If empty>
              <ThreadWelcome />
            </ThreadPrimitive.If>

            <ThreadPrimitive.Messages
              components={{
                UserMessage,
                EditComposer,
                AssistantMessage,
              }}
            />

            <ThreadPrimitive.If empty={false}>
              <div className="aui-thread-viewport-spacer min-h-8 grow" />
            </ThreadPrimitive.If>

            <Composer />
          </ThreadPrimitive.Viewport>
        </ThreadPrimitive.Root>
      </MotionConfig>
    </LazyMotion>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root mx-auto my-auto flex !w-[calc(100vw/3)] flex-grow flex-col">
      <div className="aui-thread-welcome-center flex w-full flex-grow flex-col items-center justify-center">
        <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-8">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="aui-thread-welcome-message-motion-1 text-2xl font-semibold"
          >
            Welcome!
          </m.div>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.1 }}
            className="aui-thread-welcome-message-motion-2 text-2xl text-muted-foreground/65"
          >
            How can I assist you today?
          </m.div>
        </div>
      </div>
      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions grid w-full gap-2 pb-4 @md:grid-cols-2">
      {[
        {
          title: "Get started",
          label: "with a question",
          action: "Hello, how can you help me?",
        },
        {
          title: "Learn more",
          label: "about your capabilities",
          action: "What can you help me with?",
        },
      ].map((suggestedAction, index) => (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className="aui-thread-welcome-suggestion-display [&:nth-child(n+3)]:hidden @md:[&:nth-child(n+3)]:block"
        >
          <ThreadPrimitive.Suggestion
            prompt={suggestedAction.action}
            send
            asChild
          >
            <Button
              variant="ghost"
              className="aui-thread-welcome-suggestion h-auto w-full flex-1 flex-wrap items-start justify-start gap-1 border px-5 py-4 text-left text-sm @md:flex-col dark:hover:bg-accent/60"
              aria-label={suggestedAction.action}
            >
              <span className="aui-thread-welcome-suggestion-text-1 font-medium">
                {suggestedAction.title}
              </span>
              <span className="aui-thread-welcome-suggestion-text-2 text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </ThreadPrimitive.Suggestion>
        </m.div>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  return (
    <div className="aui-composer-wrapper sticky bottom-0 mx-auto !w-[calc(100vw/3)] gap-4 overflow-visible bg-background pb-4 md:pb-6">
      <ThreadScrollToBottom />
      <ComposerPrimitive.Root 
        className="aui-composer-root group/input-group relative flex w-full flex-col rounded-xl border border-border !bg-input px-1 pt-2 shadow-xs transition-[color,box-shadow] outline-none has-[textarea:focus-visible]:ring-ring/50"
      >
        <ComposerAttachments />
        <ComposerPrimitive.Input
          placeholder="Send a message..."
          className="aui-composer-input mb-1 max-h-32 min-h-16 w-full resize-none !bg-input px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper relative mx-1 mt-2 mb-2 flex items-center justify-between">
      <ComposerAddAttachment />

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="submit"
            variant="default"
            size="icon"
            className="aui-composer-send size-[34px] rounded-full p-1"
            aria-label="Send message"
          >
            <ArrowUpIcon className="aui-composer-send-icon size-5" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="default"
            size="icon"
            className="aui-composer-cancel size-[34px] rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
            aria-label="Stop generating"
          >
            <Square className="aui-composer-cancel-icon size-3.5 fill-white dark:fill-black" />
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const formatAgentOutput = (output: string | Record<string, unknown>): string => {
  if (typeof output === "string") return output
  return JSON.stringify(output, null, 2)
}

const AgentActivityInline: FC = () => {
  const { agentHistory, isProcessing, activeAgent } = useAgentStore()
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)

  // Show when running OR when we have history from the current/recent response
  if (agentHistory.length === 0 && !isProcessing) return null

  const isComplete = !isProcessing && agentHistory.length > 0

  const toggleExpanded = (key: string) => {
    setExpandedAgent(prev => prev === key ? null : key)
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 mx-2"
    >
      {/* Vertical timeline container */}
      <div className="flex flex-col gap-0">
        {agentHistory.map((activity, index) => {
          const config = agentConfig[activity.agent] || agentConfig.orchestrator
          const Icon = config.icon
          const isActive = activeAgent === activity.agent && isProcessing && index === agentHistory.length - 1
          const isLastStep = index === agentHistory.length - 1
          const activityKey = `${activity.agent}-${activity.timestamp}`
          const isExpanded = expandedAgent === activityKey
          const hasOutput = activity.output && (
            typeof activity.output === "string" 
              ? activity.output.trim().length > 0 
              : Object.keys(activity.output).length > 0
          )

          return (
            <m.div
              key={activityKey}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 400, damping: 25 }}
              className="flex flex-col"
            >
              {/* Agent step row */}
              <div className="flex items-stretch">
                {/* Vertical line and dot indicator */}
                <div className="flex flex-col items-center mr-3 w-5">
                  {/* Top connector line */}
                  {index > 0 && (
                    <div className={cn(
                      "w-0.5 h-2 -mt-0",
                      isComplete ? config.bgColor : "bg-border"
                    )} />
                  )}
                  {/* Dot indicator */}
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full shrink-0",
                    isActive 
                      ? cn(config.bgColor, "ring-2 ring-offset-1 ring-offset-background", config.color.replace("text-", "ring-"))
                      : config.bgColor
                  )}>
                    {isActive ? (
                      <Loader2 className={cn("h-3 w-3 animate-spin", config.color)} />
                    ) : (
                      <Icon className={cn("h-3 w-3", config.color)} />
                    )}
                  </div>
                  {/* Bottom connector line */}
                  {!isLastStep && (
                    <div className={cn(
                      "w-0.5 flex-1 min-h-2",
                      isComplete ? config.bgColor : "bg-border"
                    )} />
                  )}
                </div>

                {/* Agent step content */}
                <div className="flex-1 pb-3">
                  <button
                    onClick={() => hasOutput && toggleExpanded(activityKey)}
                    disabled={!hasOutput}
                    className={cn(
                      "w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all",
                      hasOutput && "cursor-pointer hover:bg-accent/50",
                      !hasOutput && "cursor-default",
                      isExpanded && "bg-accent/30",
                      isActive && cn(config.bgColor, "ring-1 ring-inset", config.color.replace("text-", "ring-").replace("-400", "-500/30"))
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        isActive || isComplete ? config.color : "text-muted-foreground"
                      )}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground/70 truncate max-w-[200px]">
                        {activity.action}
                      </span>
                    </div>
                    {hasOutput && (
                      <ChevronDownIcon 
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    )}
                  </button>

                  {/* Expanded output content */}
                  {isExpanded && hasOutput && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 ml-1"
                    >
                      <div className={cn(
                        "rounded-lg border p-3 text-sm",
                        config.bgColor,
                        "border-current/10"
                      )}>
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current/10">
                          <Icon className={cn("h-4 w-4", config.color)} />
                          <span className={cn("text-xs font-semibold uppercase tracking-wider", config.color)}>
                            {config.label} Output
                          </span>
                        </div>
                        <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono overflow-x-auto max-h-[300px] overflow-y-auto">
                          {formatAgentOutput(activity.output)}
                        </pre>
                      </div>
                    </m.div>
                  )}
                </div>
              </div>
            </m.div>
          )
        })}

        {/* Thinking indicator when no history yet */}
        {isProcessing && agentHistory.length === 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted/40">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Starting...</span>
          </m.div>
        )}
      </div>
    </m.div>
  )
}

const AssistantMessage: FC = () => {
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
  );
};

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
  );
};

const UserMessage: FC = () => {
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
  );
};

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
  );
};

const EditComposer: FC = () => {
  return (
    <div className="aui-edit-composer-wrapper mx-auto flex !w-[calc(100vw/3)] flex-col gap-4 px-2 first:mt-4">
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-7/8 flex-col bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
          autoFocus
        />

        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" aria-label="Cancel edit">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" aria-label="Update message">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-xs text-muted-foreground",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
