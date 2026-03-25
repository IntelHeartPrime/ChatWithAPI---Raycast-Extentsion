import {
  List,
  ActionPanel,
  Action,
  Icon,
  showToast,
  Toast,
  confirmAlert,
  Alert,
  Color,
  Detail,
} from "@raycast/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { listConversations, deleteConversation, Conversation } from "./utils/history";

export default function Command() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const convs = await listConversations();
      setConversations(convs);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      showToast(Toast.Style.Failure, "加载对话历史失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  const handleDelete = useCallback(async (conversation: Conversation) => {
    const confirmed = await confirmAlert({
      title: "删除对话",
      message: `确定要删除 "${conversation.title}" 吗？`,
      primaryAction: {
        title: "删除",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        await deleteConversation(conversation.id);
        await showToast(Toast.Style.Success, "对话已删除");
        await loadConversations();
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        showToast(Toast.Style.Failure, "删除失败");
      }
    }
  }, [loadConversations]);

  const formatDate = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("zh-CN", { weekday: "short", hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
    }
  }, []);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="搜索对话...">
      {conversations.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.SpeechBubble}
          title="暂无对话历史"
          description="开始一个新对话来创建历史记录"
        />
      ) : (
        conversations.map((conversation) => (
          <List.Item
            key={conversation.id}
            icon={Icon.Message}
            title={conversation.title}
            subtitle={`${conversation.messages.length} 条消息`}
            accessories={[
              {
                tag: {
                  value: conversation.botName,
                  color: Color.Blue,
                },
              },
              {
                text: formatDate(conversation.updatedAt),
                icon: Icon.Clock,
              },
            ]}
            actions={
              <ActionPanel>
                <Action.Push
                  title="查看对话"
                  icon={Icon.Eye}
                  target={<ConversationDetail conversation={conversation} />}
                />
                <Action
                  title="删除对话"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["cmd"], key: "delete" }}
                  onAction={() => handleDelete(conversation)}
                />
                <Action
                  title="刷新列表"
                  icon={Icon.ArrowClockwise}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                  onAction={loadConversations}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

function ConversationDetail({ conversation }: { conversation: Conversation }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // 生成完整的对话内容 markdown
  const fullMarkdown = useMemo(() => {
    const header = `# ${conversation.title}\n\n`;
    const metadata = `**模型:** ${conversation.botName} | **消息数:** ${conversation.messages.length} | **创建时间:** ${new Date(conversation.createdAt).toLocaleString("zh-CN")}\n\n---\n\n`;
    
    const messages = conversation.messages
      .map((msg, index) => {
        const role = msg.role === "user" ? "👤 **You**" : "🤖 **AI**";
        const time = new Date(msg.timestamp).toLocaleString("zh-CN");
        const messageNumber = `\`#${index + 1}\``;
        return `${messageNumber} ${role} · _${time}_\n\n${msg.content}\n\n---\n`;
      })
      .join("\n");
    
    return header + metadata + messages;
  }, [conversation]);

  // 生成纯文本版本（用于复制）
  const plainTextContent = useMemo(() => {
    return conversation.messages
      .map((msg, index) => {
        const role = msg.role === "user" ? "You" : "AI";
        const time = new Date(msg.timestamp).toLocaleString("zh-CN");
        return `[${index + 1}] ${role} (${time}):\n${msg.content}\n`;
      })
      .join("\n---\n\n");
  }, [conversation]);

  // 生成单条消息的 markdown（用于快速导航）
  const getSingleMessageMarkdown = (index: number) => {
    if (index < 0 || index >= conversation.messages.length) {
      return fullMarkdown;
    }
    
    const msg = conversation.messages[index];
    const role = msg.role === "user" ? "👤 **You**" : "🤖 **AI**";
    const time = new Date(msg.timestamp).toLocaleString("zh-CN");
    
    const prevIndicator = index > 0 ? `⬆️ [上一条消息 #${index}]` : "";
    const nextIndicator = index < conversation.messages.length - 1 ? `⬇️ [下一条消息 #${index + 2}]` : "";
    const navigation = [prevIndicator, nextIndicator].filter(Boolean).join(" | ");
    
    return `# ${conversation.title}\n\n**消息 ${index + 1} / ${conversation.messages.length}**\n\n${navigation}\n\n---\n\n${role} · _${time}_\n\n${msg.content}\n\n---\n\n${navigation}`;
  };

  const [viewMode, setViewMode] = useState<"full" | "single">("full");
  const displayMarkdown = viewMode === "full" ? fullMarkdown : getSingleMessageMarkdown(currentMessageIndex);

  return (
    <Detail
      markdown={displayMarkdown}
      navigationTitle={conversation.title}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="模型" text={conversation.botName} />
          <Detail.Metadata.Label 
            title="消息数" 
            text={`${conversation.messages.length} 条`} 
          />
          <Detail.Metadata.Label 
            title="创建时间" 
            text={new Date(conversation.createdAt).toLocaleString("zh-CN")} 
          />
          <Detail.Metadata.Label 
            title="更新时间" 
            text={new Date(conversation.updatedAt).toLocaleString("zh-CN")} 
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label 
            title="查看模式" 
            text={viewMode === "full" ? "完整对话" : `单条消息 (${currentMessageIndex + 1}/${conversation.messages.length})`} 
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <ActionPanel.Section title="查看">
            {viewMode === "single" && (
              <>
                {currentMessageIndex > 0 && (
                  <Action
                    title="上一条消息"
                    icon={Icon.ArrowUp}
                    shortcut={{ modifiers: ["cmd"], key: "arrowUp" }}
                    onAction={() => setCurrentMessageIndex((prev) => Math.max(0, prev - 1))}
                  />
                )}
                {currentMessageIndex < conversation.messages.length - 1 && (
                  <Action
                    title="下一条消息"
                    icon={Icon.ArrowDown}
                    shortcut={{ modifiers: ["cmd"], key: "arrowDown" }}
                    onAction={() => setCurrentMessageIndex((prev) => Math.min(conversation.messages.length - 1, prev + 1))}
                  />
                )}
              </>
            )}
            <Action
              title={viewMode === "full" ? "切换到单条模式" : "切换到完整模式"}
              icon={viewMode === "full" ? Icon.List : Icon.Text}
              shortcut={{ modifiers: ["cmd"], key: "t" }}
              onAction={() => {
                setViewMode((prev) => prev === "full" ? "single" : "full");
                if (viewMode === "full") {
                  setCurrentMessageIndex(0);
                }
              }}
            />
          </ActionPanel.Section>
          
          <ActionPanel.Section title="操作">
            <Action.CopyToClipboard
              title="复制全部对话（纯文本）"
              content={plainTextContent}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
            <Action.CopyToClipboard
              title="复制 Markdown 格式"
              content={fullMarkdown}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
            {viewMode === "single" && (
              <Action.CopyToClipboard
                title="复制当前消息"
                content={conversation.messages[currentMessageIndex].content}
                shortcut={{ modifiers: ["cmd", "opt"], key: "c" }}
              />
            )}
          </ActionPanel.Section>
          
          <ActionPanel.Section title="导航">
            {viewMode === "single" && conversation.messages.length > 2 && (
              <>
                <Action
                  title="跳到第一条"
                  icon={Icon.ArrowUpCircle}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "arrowUp" }}
                  onAction={() => setCurrentMessageIndex(0)}
                />
                <Action
                  title="跳到最后一条"
                  icon={Icon.ArrowDownCircle}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "arrowDown" }}
                  onAction={() => setCurrentMessageIndex(conversation.messages.length - 1)}
                />
              </>
            )}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
