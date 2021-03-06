import _ from 'lodash';
import { EntitiesEventEmitter } from './entities.events';

export class AttributesProxyHandler
  implements ProxyHandler<{ [key: string]: string | number | boolean }> {
  constructor(
    private readonly entityId: string,
    private readonly distributed: boolean,
    private readonly stateLocked: boolean,
    private readonly emitter: EntitiesEventEmitter,
    private readonly isLeader: () => boolean
  ) {}

  set(
    target: { [p: string]: string | number | boolean },
    p: string | number | symbol,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    value: any
  ): boolean {
    const oldValue = target[p as string];
    target[p as string] = value;

    if (
      !_.isEqual(value, oldValue) &&
      (!this.distributed || !this.stateLocked || this.isLeader())
    ) {
      this.emitter.emit(
        'attributesUpdate',
        this.entityId,
        target,
        this.distributed
      );
    }

    return true;
  }
}
