/* c8 ignore next 152 */
export const data = [
  {
    label: 'Child 1',
    selected: true,
    expanded: false,
    children: [
      {
        label: 'Child 1.1',
        selected: true,
        expanded: false,
      },
      {
        label: 'Child 1.2',
        selected: true,
        expanded: true,
        children: [
          {
            label: 'Child 1.2.1',
            selected: false,
            expanded: false,
          },
          {
            label: 'Child 1.2.2',
            selected: true,
            expanded: false,
          },
        ],
      },
      {
        label: 'Child 1.3',
        selected: true,
        expanded: false,
      },
    ],
  },
  {
    label: 'Child 2 - load on demand children',
    selected: true,
    expanded: false,
    loadOnDemand: true,
  },
  {
    label: 'Child 3 - load on demand children',
    selected: true,
    expanded: false,
    loadOnDemand: true,
  },
  {
    label: 'Child 4',
    selected: false,
    expanded: false,
  },
];

const data2 = [
  {
    label: 'Load on demand child 2.1',
    selected: true,
    expanded: false,
  },
  {
    label: 'Load on demand child 2.2',
    selected: false,
    expanded: false,
    loadOnDemand: true,
  },
  {
    label: 'Load on demand child 2.3',
    selected: false,
    expanded: false,
  },
];

const data2_2 = [
  {
    label: 'Load on demand child 2.2.1',
    selected: false,
    expanded: false,
  },
  {
    label: 'Load on demand child 2.2.2',
    selected: false,
    expanded: false,
  },
];

const data3 = [
  {
    label: 'Load on demand child 3.1',
    selected: false,
    expanded: false,
  },
  {
    label: 'Load on demand child 3.2',
    selected: false,
    loadOnDemand: true,
    expanded: false,
  },
  {
    label: 'Load on demand child 3.3',
    selected: false,
    expanded: false,
  },
];

const data3_2 = [
  {
    label: 'Load on demand child 3.2.1',
    selected: false,
    loadOnDemand: true,
    expanded: false,
  },
  {
    label: 'Load on demand child 3.2.2',
    selected: false,
    expanded: false,
  },
];

const data3_2_1 = [
  {
    label: 'Load on demand child 3.2.1.1',
    selected: false,
    expanded: false,
  },
];

export class DataService {
  public static getData(item?: any): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!item) {
          return resolve(data);
        } else {
          switch (item.label) {
            case 'Child 2 - load on demand children':
              return resolve(data2);
            case 'Child 3 - load on demand children':
              return resolve(data3);
            case 'Load on demand child 2.2':
              return resolve(data2_2);
            case 'Load on demand child 3.2':
              return resolve(data3_2);
            case 'Load on demand child 3.2.1':
              return resolve(data3_2_1);
          }
        }
      }, 1500);
    });
  }
}
