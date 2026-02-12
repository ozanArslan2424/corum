import { makeLogger } from "@/internal/modules/Logger/LoggerClass";
import type { ServiceInterface } from "@/internal/modules/Service/ServiceInterface";

export class ServiceAbstract implements ServiceInterface {
	readonly logger = makeLogger(this.constructor.name);
}
