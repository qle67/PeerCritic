export interface Friend {
  userId: number;         // Unique user identifier
  username: string;       // Public username
  firstName: string;
  lastName: string;
  avatar: string | null;
}
// Active tab in Friends List
export type FriendsTab = "friends" | "received" | "sent";
// List: Show friends + requests
// Add: Show user search to send new requests.
export type FriendsMode = "list" | "add";