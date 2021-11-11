
import Accessor from "@arcgis/core/core/Accessor";
import { subclass } from "@arcgis/core/core/accessorSupport/decorators";
import Evented from "@arcgis/core/core/Evented";

// A type to represent a constructor function
type Constructor<T = object> = new (...args: any[]) => T;

// A type to represent a mixin function
// See for more details https://www.bryntum.com/blog/the-mixin-pattern-in-typescript-all-you-need-to-know/
type Mixin<T extends (...input: any[]) => any> = InstanceType<ReturnType<T>>;

// TBase extends Constructor<Accessor> indicates that `EventedMixin`
// expects the base class to extend `Accessor`, for example to be able to use the `watch` method.
export const EventedMixin = <TBase extends Constructor<Accessor>>(Base: TBase) => {

  @subclass("EventedAccessor")
  class EventedAccessor extends Base {
    emitter:Evented = new Evented()
    emit(type: string, event?: any): boolean {
      return this.emitter.emit(type,event)
    }
    on(type: string, listener: (event: any) => void): IHandle {
     return this.emitter.on(type,listener)
    }
  }
  return EventedAccessor;
}
export type EventedMixin = Mixin<typeof EventedMixin>;