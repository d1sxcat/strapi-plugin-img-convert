import { produce } from 'immer';
import set from 'lodash/set';

export type InitialState = {
  initialData: {
    convertTo: string;
    convertFromJPEG?: boolean;
    convertFromPNG?: boolean;
    convertFromTIFF?: boolean;
  } | null;
  modifiedData: {
    convertTo: string;
    convertFromJPEG?: boolean;
    convertFromPNG?: boolean;
    convertFromTIFF?: boolean;
  } | null;
};

interface ActionGetDataSucceeded {
  type: 'GET_DATA_SUCCEEDED';
  data: InitialState['initialData'];
}

interface ActionOnChange {
  type: 'ON_CHANGE';
  keys: keyof NonNullable<InitialState['initialData']>;
  value: string | boolean
}

export type Action = ActionGetDataSucceeded | ActionOnChange;

const initialState: InitialState = {
  initialData: {
    convertTo: 'webp',
    convertFromJPEG: true,
    convertFromPNG: true,
    convertFromTIFF: true,
  },
  modifiedData: {
    convertTo: 'webp',
    convertFromJPEG: true,
    convertFromPNG: true,
    convertFromTIFF: true,
  },
};

const reducer = (state: InitialState, action: Action) =>
  produce(state, (drafState) => {
    switch (action.type) {
      case 'GET_DATA_SUCCEEDED': {
        drafState.initialData = action.data;
        drafState.modifiedData = action.data;
        break;
      }
      case 'ON_CHANGE': {
        set(drafState, ['modifiedData', ...action.keys.split('.')], action.value);
        break;
      }
      default:
        return state;
    }
  });

export { initialState, reducer };
