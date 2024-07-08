import { toLower } from "ramda";
import AWS_KAFKA_PLANS from "../../kafka/aws/plans.json";
import LINODE_KAFKA_PLANS from "../../kafka/linode/plans.json";

export interface Plans {
    id: string, // internal id
    label: string, // label for plan
    heading: string, // plan heading for create_kafka screen
    formattedLabel: string, // plan detail for summary section
    provider: string, // for rendering depending on chosen provider
    group: string, // kind of plan
    class: string, // creating tabs for plan class
    plan: string, // actual size field required by provider
    disk: number,
    memory: number,
    vcpus: number,
    nodes: number, // controls number of nodes deployed
    network_out: number,
    network_in: number,
    transfer: number,
    price_hourly: number,
    price: {
        hourly: number,
        monthly: number
    },
    subHeadings: string[]
}
/*
Define Kafka Plans per provider and plan.
Function will return a list of plans for a given provider and plan.
UI component will use this list to display the plans.
 */

export class StacksVillePlansKafka {
    private aws_plans: Plans[];
    private linode_plans: Plans[];

    constructor() {
        this.aws_plans = AWS_KAFKA_PLANS;
        this.linode_plans = LINODE_KAFKA_PLANS;
    }

    /*
    Returns all plans
    */
    getPlans() {
        return this.aws_plans.concat(this.linode_plans);
    }

    /*
    Returns a plan by the internal plan id
    */
    getPlanByID(id?: string) {
        if ((typeof id === undefined) || (id === undefined)) {
            return undefined;
        }
        const id_segments = id?.split("-");
        if (toLower(id_segments[1]) === "linode") {
            return this.linode_plans.filter((plan: any) => plan.id === id);
        }
        else if (toLower(id_segments[0]) === "aws") {
            return this.aws_plans.filter((plan: any) => plan.id === id);
        }
    }

    /*
    Gets all plans by a provider
    */
    getKafkaListByProvider(provider?: string) {
        if (typeof provider === undefined) {
            return this.getPlans();
        }
        else if (provider === "linode") {
            return this.linode_plans;
        }
        else if (provider === "AWS") {
            return this.aws_plans;
        }
    }

    /*
    Gets the pricing by hour and month for a plan by a specific internal id
    */
    getKafkaPriceListByPlan(plan?: string) {
        if (plan === undefined) {
            const r = [
                {
                "price": {
                    "hourly": 0.0,
                    "monthly": 0
                },
                "nodes": 0
                }
            ]
            return r;
        }
        return this.getPlanByID(plan);
    }

    /*
    Gets plans by provider and region combination - if we would like to support such a function at a later stage.
    Currently its functionality is the same as getKafkaListByProvider
    */
    /*getKafkaListByProviderAndPlan(provider?: string, region?: string) {
        if (typeof region === undefined) {
            this.getKafkaListByProvider(provider);
        }

        return this.plans.filter((plan: any) => plan.provider === provider)
    }*/
}
