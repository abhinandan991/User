import AWS_REGIONS from "../../kafka/aws/regions.json";
import LINODE_REGIONS from "../../kafka/linode/regions.json";

interface Regions {
    provider: string,
    id: string,
    country: string,
    label: string,
    capabilities: string[],
    status: string
}
/*
REGIONS define the regions available for the user to select from.
These are defined per provider.
Function will return a list of regions for a given provider.
Field Significance:
capabilities: Required for render
country: Required to group regions depending on country code
provider: To render regions depending on the provider id
 */
  
export class StacksVilleRegions{
    private aws_regions: Regions[];
    private linode_regions: Regions[];

    constructor() {
        this.aws_regions = AWS_REGIONS;
        this.linode_regions = LINODE_REGIONS;
    }

    getRegions() {
        return this.aws_regions.concat(this.linode_regions);
    }

    getRegionID(id:string, provider_id:string) {
        if (provider_id === "linode") {
            return this.linode_regions.find((region) => region.id === id);
        }
        else if (provider_id === "AWS") {
            return this.aws_regions.find((region) => region.id === id);
        }
    }

    getRegionByProvider(provider?: string) {
        if (provider === undefined) {
            return this.getRegions();
        }
        else if (provider === "linode") {
            return this.linode_regions;
        }
        else if (provider === "AWS") {
            return this.aws_regions;
        }
    }
}