const BOARD_SEED = {
  _id: '6350d443bddbe8fed0138ffd',
  title: 'test board',
  taskStatus: [
    '6350d443bddbe8fed0138ff4',
    '6350d443bddbe8fed0138ff5',
    '6350d443bddbe8fed0138ff6',
    '6350d443bddbe8fed0138ff7',
  ],
};

const BOARD_TEST = {
  id: '6358beaba662585de524593d',
  title: 'kitman-test',
  createdAt: '2022-10-26T04:59:23.945Z',
  updatedAt: '2022-10-26T04:59:23.945Z',
};

const BOARD_BY_LABELS = {
  id: '6358beaba662585de524593d',
  title: 'kitman-test',
  taskStatus: [
    {
      id: '6358beaba662585de5245935',
      name: 'to do',
      slug: 'to-do',
      order: 0,
      taskList: [
        {
          title: 'test one',
          tags: [
            { id: '6340129a5eb06d386302b22b', name: 'Backend' },
            { id: '6381d2cfa6c3f10a7e8ae07e', name: 'Frontend' },
            { id: '63821552a6c3f10a7e8b029e', name: 'Fullstack' },
          ],
          comments: [],
          status: '6358beaba662585de5245935',
          priority: 'Highest',
          projectId: '6358beaba662585de524593e',
          boardId: '6358beaba662585de524593d',
          sprintId: null,
          description: '',
          storyPoint: 0,
          dueAt: '2023-03-04T04:17:15.545Z',
          reporterId: '631dd53189d19ed1f532fb85',
          assignId: null,
          typeId: '631d94d08a05945727602cdb',
          attachmentUrls: [],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: '6402c64c0483d830e2be84f0',
        },
      ],
    },
    {
      id: '6358beaba662585de5245936',
      name: 'in progress',
      slug: 'in-progress',
      order: 1,
      taskList: [
        {
          title: 'Label Feature',
          tags: [
            { id: '6340129a5eb06d386302b22b', name: 'Backend' },
            { id: '6381d2cfa6c3f10a7e8ae07e', name: 'Frontend' },
            { id: '63821552a6c3f10a7e8b029e', name: 'Fullstack' },
            { id: '6384356974f5a87e15259511', name: 'Database' },
          ],
          comments: [],
          status: '6358beaba662585de5245936',
          priority: 'Highest',
          projectId: '6358beaba662585de524593e',
          boardId: '6358beaba662585de524593d',
          sprintId: '63f466c242d05a01bdfbb1b0',
          description: '',
          storyPoint: 0,
          dueAt: '2023-03-01T05:05:14.587Z',
          reporterId: '631dd53189d19ed1f532fb85',
          assignId: {
            id: '63e582bccc7419e65c929458',
            avatarIcon: 'https://kitmanimage.s3.ap-southeast-2.amazonaws.com/1675985752215.jpg',
            name: 'JoeJoe_ZhouTian',
          },
          typeId: '631d94d08a05945727602cd6',
          attachmentUrls: [],
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: '63fedd0b7067d5e5a454f302',
        },
      ],
    },
    { id: '6358beaba662585de5245937', name: 'review', slug: 'review', order: 2, taskList: [] },
    { id: '6358beaba662585de5245938', name: 'done', slug: 'done', order: 3, taskList: [] },
  ],
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};

module.exports = {
  BOARD_SEED,
  BOARD_TEST,
  BOARD_BY_LABELS,
};
