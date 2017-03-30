import { Location } from './location';
import { Status } from './status';
import { BoatType } from './boat-type';
import { BoatCondition } from './boat-condition';

export interface Case {

  _id: string;
  location: Location;
  state: Status;
  boatType: BoatType;
  boatCondition: BoatCondition;
  engineWorking: boolean;
  peopleCount: number;
  womenCount: number;
  childrenCount: number;
  disabledCount: number;
  reportedBy?: string;
}
