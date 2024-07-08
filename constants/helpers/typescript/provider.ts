import providers from "../../kafka/providers.json"

interface Provider {
    provider: string,
    id: string,
    label: string,
    vendor: string
}

/*
Constant for provider available for user to select from.
Field significance:
id: Required to identify option
vendor: Groups the platforms (we can decide not to use it)
 */
export const PROVIDERS: Provider[] = providers;
  