export type StaticRouteDefinition =
	// just the file path, doesn't stream
	| string
	| {
			filePath: string;
			stream: true;
			// defaults to attachment
			disposition?: "attachment" | "inline";
	  };
