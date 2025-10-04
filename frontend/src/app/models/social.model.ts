// Interfaces pour les amis et groupes

export interface Friend {
  _id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  requestedBy: string;
  requestedAt: Date;
  respondedAt?: Date;
  friend?: {
    _id: string;
    prenom: string;
    nom: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: Date;
  };
}

export interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    prenom: string;
    nom: string;
    email: string;
    avatar?: string;
  };
  to: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  color?: string;
  type: 'private' | 'public' | 'restricted';
  createdBy: string;
  members: GroupMember[];
  settings: GroupSettings;
  stats?: GroupStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  permissions?: GroupPermissions;
  user?: {
    _id: string;
    prenom: string;
    nom: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
  };
}

export interface GroupPermissions {
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canEditGroup: boolean;
  canViewPrivateEvents: boolean;
}

export interface GroupSettings {
  allowMemberInvites: boolean;
  requireApprovalForJoin: boolean;
  defaultEventVisibility: 'private' | 'members' | 'public';
  allowEventComments: boolean;
  allowEventSharing: boolean;
  maxMembers?: number;
}

export interface GroupStats {
  totalMembers: number;
  totalEvents: number;
  activeMembers: number;
  upcomingEvents: number;
}

export interface GroupInvitation {
  _id: string;
  groupId: string;
  group?: {
    _id: string;
    name: string;
    description?: string;
    avatar?: string;
    memberCount: number;
  };
  invitedBy: string;
  invitedUser: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces pour les requêtes API
export interface SendFriendRequestData {
  friendEmail: string;
  message?: string;
}

export interface RespondToFriendRequestData {
  requestId: string;
  action: 'accept' | 'decline';
}

export interface CreateGroupData {
  name: string;
  description?: string;
  type: 'private' | 'public' | 'restricted';
  color?: string;
  settings: Partial<GroupSettings>;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  color?: string;
  settings?: Partial<GroupSettings>;
}

export interface InviteToGroupData {
  groupId: string;
  emails: string[];
  message?: string;
}

export interface UpdateMemberRoleData {
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  permissions?: Partial<GroupPermissions>;
}

// Interfaces pour les réponses API
export interface FriendsResponse {
  friends: Friend[];
  total: number;
  page: number;
  limit: number;
}

export interface FriendRequestsResponse {
  sent: FriendRequest[];
  received: FriendRequest[];
  total: number;
}

export interface GroupsResponse {
  groups: Group[];
  total: number;
  page: number;
  limit: number;
}

export interface GroupDetailsResponse {
  group: Group;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
  canManage: boolean;
}

export interface GroupInvitationsResponse {
  invitations: GroupInvitation[];
  total: number;
}