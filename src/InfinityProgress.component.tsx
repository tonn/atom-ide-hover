import etch from 'etch';
import { EtchComponentBase } from './EtchComponentBase';

export class InfinityProgress extends EtchComponentBase<{ key: string }> {
  render() {
    return <div className={'InfinityProgress'}>
             <div className={'InfinityProgress__Indicator'}>
             </div>
           </div>;
  }
}
