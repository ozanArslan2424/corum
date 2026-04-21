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
		readonly bundleConfig?: Partial<BundleRouteConfig>,
	) {
		super();

		if (bundleConfig?.cache) this.cache = bundleConfig.cache;
		if (bundleConfig?.ignore) this.ignore = bundleConfig.ignore;
		if (bundleConfig?.assetsDir) this.assetsDir = bundleConfig.assetsDir;
		if (bundleConfig?.onFileNotFound) this.onFileNotFound = bundleConfig.onFileNotFound;
		if (bundleConfig?.onIgnore) this.onIgnore = bundleConfig.onIgnore;

		this.register();
	}
}
