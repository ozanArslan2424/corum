import { BundleRouteAbstract } from "@/BundleRoute/BundleRouteAbstract";
import type { BundleRouteConfig } from "@/BundleRoute/BundleRouteConfig";

export class BundleRoute<
  B = unknown,
  S = unknown,
  P = unknown,
  E extends string = string,
> extends BundleRouteAbstract<B, S, P, E> {
  constructor(
    readonly path: E,
    readonly dir: string,
    readonly bundleConfig?: BundleRouteConfig,
  ) {
    super();
    this.register();
  }
}
