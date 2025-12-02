import { LazyMotion, MotionConfig, domAnimation } from "motion/react"
import { ThreadPrimitive } from "@assistant-ui/react"
import { type FC } from "react"
import { ThreadWelcome } from "@/components/assistant-ui/thread-welcome"
import { Composer } from "@/components/assistant-ui/composer"
import { UserMessage } from "@/components/assistant-ui/user-message"
import { EditComposer } from "@/components/assistant-ui/edit-composer"
import { AssistantMessage } from "@/components/assistant-ui/assistant-message"

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
  )
}
