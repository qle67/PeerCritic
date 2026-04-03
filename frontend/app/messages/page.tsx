"use client";

import Navbar from "@/app/navbar";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type MemberRow = {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  unreadCount: number;
};

type CurrentUser = {
  userId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
};

type FriendRow = {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

type ConversationRow = {
  conversationId: number;
  isGroup: boolean;
  conversationName: string | null;
  otherUser: null | {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  unreadCount: number;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  lastMessageFromUserId: number | null;
};

type MsgRow = {
  messageId: number;
  conversationId: number;
  fromUserId: number;
  messageText: string;
  sentDatetime: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const api = axios.create({
  baseURL: "http://localhost:8000",
});

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Messages() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [selected, setSelected] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [draft, setDraft] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [friendQuery, setFriendQuery] = useState("");
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [memberMap, setMemberMap] = useState<Record<number, MemberRow>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const subscribedConvRef = useRef<number | null>(null);
  const selectedRef = useRef<ConversationRow | null>(null);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  async function loadMembers(conversationId: number) {
    const res = await api.get<MemberRow[]>(
      `/messages/conversations/${conversationId}/members`,
      { headers: authHeaders() }
    );
    const map: Record<number, MemberRow> = {};
    for (const m of res.data) map[m.userId] = m;
    setMemberMap(map);
  }

  async function fetchMe() {
    const res = await api.get<CurrentUser>("/current_user", {
      headers: authHeaders(),
    });
    setMe(res.data);
  }

  async function loadFriends() {
    setLoadingFriends(true);
    try {
      const res = await api.get<FriendRow[]>("/my/friends", {
        headers: authHeaders(),
      });
      setFriends(res.data);
    } finally {
      setLoadingFriends(false);
    }
  }

  function ensureWs() {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("No access token found for WebSocket");
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${protocol}://localhost:8000/ws/messages?token=${encodeURIComponent(token)}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS open");
    };

    ws.onmessage = (event) => {
      console.log("WS raw message:", event.data);

      try {
        const data = JSON.parse(event.data);

        if (data.type === "message" && data.message) {
          const m = data.message as MsgRow;

          const isCurrentConversation =
            !!selectedRef.current &&
            m.conversationId === selectedRef.current.conversationId;

          setMessages((prev) => {
            if (!isCurrentConversation) return prev;
            if (prev.some((x) => x.messageId === m.messageId)) return prev;
            return [...prev, m];
          });

          const refresh = () => refreshConversations().catch(console.log);

          if (isCurrentConversation) {
            api.post(
              `/messages/conversations/${m.conversationId}/read`,
              {},
              { headers: authHeaders() }
            )
              .then(refresh)
              .catch(console.log);
          } else {
            refresh();
          }
        }

        if (data.type === "conversation_update") {
          refreshConversations().catch(console.log);
        }

        if (data.type === "inbox_update") {
          refreshConversations().catch(console.log);
        }

        if (data.type === "error") {
          console.log("WS server error message:", data.message);
        }

        if (data.type === "connected") {
          console.log("WS connected ack:", data);
        }

        if (data.type === "subscribed") {
          console.log("WS subscribed ack:", data);
        }

        if (data.type === "unsubscribed") {
          console.log("WS unsubscribed ack:", data);
        }
      } catch (e) {
        console.log("WS message parse error:", e);
      }
    };

    ws.onerror = () => {
      console.log("WS error event fired");
    };

    ws.onclose = (event) => {
      console.log(
        `WS close code=${event.code} reason="${event.reason}" clean=${event.wasClean}`
      );
      wsRef.current = null;
      subscribedConvRef.current = null;
    };
  }

  async function createDmWith(friendUserId: number) {
    const res = await api.post<{ conversationId: number }>(
      `/messages/dm/${friendUserId}`,
      {},
      { headers: authHeaders() }
    );

    // refresh conversations and open the created one
    await refreshConversations();
    const convoId = res.data.conversationId;

    const conv =
      conversations.find((c) => c.conversationId === convoId) ??
      (await api
        .get<ConversationRow[]>("/messages/conversations", { headers: authHeaders() })
        .then((r) => r.data.find((c) => c.conversationId === convoId)));

    if (conv) {
      await openConversation(conv);
    }

    setNewOpen(false);
    setFriendQuery("");
  }

  async function refreshConversations() {
    const res = await api.get<ConversationRow[]>("/messages/conversations", {
      headers: authHeaders(),
    });
    setConversations(res.data);
  }

  async function openConversation(conv: ConversationRow) {
    setSelected(conv);

    ensureWs();
    const ws = wsRef.current;

    if (ws) {
      if (
        ws.readyState === WebSocket.OPEN &&
        subscribedConvRef.current &&
        subscribedConvRef.current !== conv.conversationId
      ) {
        ws.send(
          JSON.stringify({
            action: "unsubscribe",
            conversationId: subscribedConvRef.current,
          })
        );
      }

      if (subscribedConvRef.current !== conv.conversationId) {
        const subscribe = () => {
          if (ws.readyState !== WebSocket.OPEN) return;

          ws.send(
            JSON.stringify({
              action: "subscribe",
              conversationId: conv.conversationId,
            })
          );
          subscribedConvRef.current = conv.conversationId;
        };

        if (ws.readyState === WebSocket.OPEN) {
          subscribe();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.addEventListener("open", subscribe, { once: true });
        }
      }
    }

    await loadMembers(conv.conversationId);

    const res = await api.get<MsgRow[]>(
      `/messages/conversations/${conv.conversationId}/messages?limit=80`,
      { headers: authHeaders() }
    );
    setMessages(res.data);

    await api.post(
      `/messages/conversations/${conv.conversationId}/read`,
      {},
      { headers: authHeaders() }
    );

    await refreshConversations();
  }

  async function sendMessage() {
    if (!selected) return;
    const text = draft.trim();
    if (!text) return;

    setDraft("");

    const res = await api.post<MsgRow>(
      `/messages/conversations/${selected.conversationId}/messages`,
      { messageText: text },
      { headers: authHeaders() }
    );

    const newMsg = res.data;

    setMessages((prev) => {
      if (prev.some((m) => m.messageId === newMsg.messageId)) return prev;
      return [...prev, newMsg];
    });

    refreshConversations().catch(console.log);
  }

  function senderInfo(fromUserId: number) {
    const m = memberMap[fromUserId];
    if (m) {
      return {
        username: m.username,
        avatar: m.avatar ?? null,
        isMe: me ? fromUserId === me.userId : false,
      };
    }

    return {
      username: `User ${fromUserId}`,
      avatar: null,
      isMe: me ? fromUserId === me.userId : false,
    };
  }


  useEffect(() => {
    fetchMe().catch(console.error);
    refreshConversations().catch(console.error);

    ensureWs();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const headerTitle = selected
    ? selected.isGroup
      ? selected.conversationName ?? "Group"
      : selected.otherUser
        ? `${selected.otherUser.firstName} ${selected.otherUser.lastName}`.trim() ||
        selected.otherUser.username
        : "DM"
    : "";

  const headerAvatar = selected?.isGroup ? null : selected?.otherUser?.avatar ?? null;

  return (
    <>
      <Navbar />

      <div className="h-[calc(100dvh-56px)] bg-muted/30">
        <div className="h-full min-h-0 grid grid-cols-1 md:grid-cols-[340px_1fr]">
          {/*Conversation List*/}
          <aside className="h-full min-h-0 border-r border-orange-200 bg-orange-100/60 dark:border-orange-800 dark:bg-orange-950/55 backdrop-blur supports-[backdrop-filter]:bg-orange-100/50 dark:supports-[backdrop-filter]:bg-orange-950/45">
            <div className="h-full min-h-0 flex flex-col">
              <div className="p-3 border-b border-orange-200 dark:border-orange-800 bg-orange-100/70 dark:bg-orange-950/55">
                <div className="flex items-center justify-between">
                  <h1 className="text-base font-semibold tracking-tight">Messages</h1>

                  <Dialog
                    open={newOpen}
                    onOpenChange={(v) => {
                      setNewOpen(v);
                      if (v) loadFriends().catch(console.error);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 rounded-xl border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200"
                        aria-label="New message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>New message</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-3">
                        <Input
                          value={friendQuery}
                          onChange={(e) => setFriendQuery(e.target.value)}
                          placeholder="Search friends…"
                        />

                        <div className="max-h-[320px] overflow-auto rounded-xl border p-2">
                          {loadingFriends ? (
                            <div className="p-3 text-sm text-muted-foreground">Loading…</div>
                          ) : (
                            friends
                              .filter((f) => {
                                const q = friendQuery.trim().toLowerCase();
                                if (!q) return true;
                                const full = `${f.firstName} ${f.lastName} ${f.username}`.toLowerCase();
                                return full.includes(q);
                              })
                              .map((f) => (
                                <button
                                  key={f.userId}
                                  onClick={() => createDmWith(f.userId).catch(console.error)}
                                  className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted"
                                >
                                  {f.avatar ? (
                                    <img
                                      src={f.avatar}
                                      alt=""
                                      className="h-9 w-9 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-9 w-9 rounded-full bg-muted" />
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">
                                      {`${f.firstName} ${f.lastName}`.trim() || f.username}
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                      @{f.username}
                                    </div>
                                  </div>

                                  <Plus className="h-4 w-4 text-muted-foreground" />
                                </button>
                              ))
                          )}

                          {!loadingFriends && friends.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground">
                              No friends yet.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-orange-100/70 dark:bg-orange-950/55 px-4 py-2 border border-orange-200 dark:border-orange-800">
                  <Input
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Search"
                  />
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
                {conversations.map((c) => {
                  const active = selected?.conversationId === c.conversationId;

                  const title = c.isGroup
                    ? c.conversationName ?? "Group"
                    : c.otherUser
                      ? `${c.otherUser.firstName} ${c.otherUser.lastName}`.trim() ||
                      c.otherUser.username
                      : "DM";

                  const avatar = c.isGroup ? null : c.otherUser?.avatar ?? null;

                  return (
                    <button
                      key={c.conversationId}
                      onClick={() => openConversation(c)}
                      className={cx(
                        "w-full text-left rounded-xl px-3 py-2.5 transition-colors",
                        "hover:bg-orange-200/50 dark:hover:bg-orange-900/30",
                        active && "bg-orange-200/60 dark:bg-orange-900/35"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-orange-200/70 dark:bg-orange-900/40" />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium leading-tight truncate">
                              {title}
                            </div>

                            {c.unreadCount > 0 && selected?.conversationId !== c.conversationId ? (
                              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-semibold text-white">
                                {c.unreadCount}
                              </span>
                            ) : null}
                          </div>

                          <div className="text-sm text-muted-foreground truncate">
                            {c.lastMessageText ?? "—"}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {conversations.length === 0 ? (
                  <div className="px-3 py-6 text-sm text-muted-foreground">
                    No conversations yet.
                  </div>
                ) : null}
              </div>
            </div>
          </aside>

          {/*Current Conversation*/}
          <section className="h-full min-h-0 min-w-0 overflow-hidden">
            {selected ? (
              <div className="h-full min-h-0 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-orange-200 bg-orange-100/70 dark:border-orange-800 dark:bg-orange-950/55 backdrop-blur supports-[backdrop-filter]:bg-orange-100/60 dark:supports-[backdrop-filter]:bg-orange-950/45">
                  <div className="px-4 py-3 flex items-center gap-3">
                    {headerAvatar ? (
                      <img
                        src={headerAvatar}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-orange-200/70 dark:bg-orange-900/40" />
                    )}

                    <div className="min-w-0">
                      <div className="font-semibold leading-tight truncate">
                        {headerTitle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selected.isGroup ? "Group chat" : "Direct message"}
                      </div>
                    </div>
                  </div>
                </div>

                {/*Messages*/}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-1">
                  {messages.map((m, idx) => {
                    const info = senderInfo(m.fromUserId);
                    const prev = messages[idx - 1];
                    const isGrouped = prev && prev.fromUserId === m.fromUserId;

                    return (
                      <div
                        key={m.messageId}
                        className={cx(
                          "flex gap-2.5 rounded-xl px-2 py-1",
                          "hover:bg-orange-100/60 dark:hover:bg-orange-950/30"
                        )}
                      >
                        <div className="w-10">
                          {!isGrouped ? (
                            info.avatar ? (
                              <img
                                src={info.avatar}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-orange-200/70 dark:bg-orange-900/40" />
                            )
                          ) : (
                            <div className="h-10 w-10" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          {!isGrouped ? (
                            <div className="flex items-baseline gap-2">
                              <div className={cx("font-semibold text-sm truncate", info.isMe && "text-orange-700 dark:text-orange-200")}>
                                {info.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(m.sentDatetime).toLocaleString()}
                              </div>
                            </div>
                          ) : null}

                          <div className="text-sm leading-snug text-foreground/90 whitespace-pre-wrap break-words">
                            {m.messageText}
                          </div>
                        </div>
                      </div>
                    );
                  })}


                  {messages.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No messages yet. Say hi!
                    </div>
                  ) : null}
                </div>

                {/*Messege Composer*/}
                <div className="border-t border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/40">
                  <div className="p-3">
                    <div className="flex items-center gap-2 rounded-2xl bg-orange-50 dark:bg-orange-950/40 px-4 py-3 border border-orange-200 dark:border-orange-800">
                      <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={
                          selected.isGroup
                            ? `Message ${selected.conversationName ?? "group"}`
                            : `Message @${selected.otherUser?.username ?? "user"}`
                        }
                        className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendMessage();
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        className="bg-orange-500 hover:bg-orange-400"
                      >
                        Send
                      </Button>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground px-1">
                      Press Enter to send
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a conversation
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}