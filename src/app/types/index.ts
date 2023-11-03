import { Types } from 'mongoose';
export interface ITask {
  id: string;
  title: string;
  tags: string[];
  comments: string[];
  status: {
    id: string;
    name: string;
    slug: string;
    order: number;
  };
  priority: string;
  projectId: string;
  boardId: string;
  sprintId: string | null;
  description: string;
  storyPoint: number;
  dueAt: string;
  reporterId: {
    id: string;
    email: string;
    avatarIcon: string;
    name: string;
  };
  assignId: string | null;
  typeId: {
    id: string;
    slug: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    icon: string;
  };
  isActive: boolean;
  attachmentUrls: string[];
  createdAt: string;
  updatedAt: string;
}

//====== dashboard ======

export enum StatusName {
  TO_DO = 'to do',
  IN_PROGRESS = 'in progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum SupportType {
  NO_SUPPORT,
  TECHNICAL,
  REQUIREMENT,
  DEPENDENCY,
  OTHER,
}

export interface IProgress {
  timeStamp: number;
  _id: string;
  value: number;
}

export interface IDailyScrum {
  _id: Types.ObjectId;
  user: {
    _id: Types.ObjectId;
    name: string;
  };
  title: string;
  progresses: IProgress[];
}

export interface IDailyScrumTimeStampModified extends Omit<IDailyScrum, 'progresses'> {
  progresses: {
    timeStamp: string;
    _id: string;
    value: number;
  }[];
}
