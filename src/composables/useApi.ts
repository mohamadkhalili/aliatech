import type { ComputedRef, Ref } from "vue"
import { ref, computed } from "vue";
import upperFirst from "lodash/upperFirst";
import { apiStatus } from "@/api/constants/apiStatus";
const { IDLE, SUCCESS, PENDING, ERROR } = apiStatus;

// type apiStatus = typeof apiStatus;
// type Color = keyof apiStatus; 

const anObject = apiStatus;
// const openObject: { [k: string]: any } & typeof anObject = anObject;

type CapitalizeKeys<T> = {
  [P in keyof T as `${Capitalize<Lowercase<string & P>>}`]: T[P];
}

type apiStatus = CapitalizeKeys<typeof apiStatus>;
type apiStatusType = `status${CapitalizeKeys<keyof apiStatus>}`;
/**
 * Create an object of computed statuses
 *
 * @param {Symbol} status
 */
const createNormalisedApiStatuses = (status: any): { [key in apiStatusType]?: ComputedRef<boolean> } => {
  let normalisedApiStatuses: { [key in apiStatusType]?: ComputedRef<boolean> } = {};
  for (const [statusKey, statusValue] of Object.entries(apiStatus)) {
    let propertyName: apiStatusType;
    // Create a property name for each computed status
    // if (apiName) {
    //   propertyName = `${apiName}Status${upperFirst(statusKey.toLowerCase())}`;
    // } else {
    // @ts-ignore
    propertyName = `status${upperFirst(statusKey.toLowerCase())}`;
    // }
    // Create a computed that returns true/false based on
    // the currently selected status
    normalisedApiStatuses[propertyName] = computed(
      () => statusValue === status.value
    );
  }
  return normalisedApiStatuses;
};
/**
 * @param {function} fn
 * @param {object} config
 */
export const useApi = <A extends any[], R, I>(
  fn: (...argsFunction: A) => R,
  config?: { initialData?: I; responseAdapter?: (response: R) => I }
) => {
  const { initialData, responseAdapter } = config
    ? config
    : { initialData: undefined as unknown as I, responseAdapter: null };

  // Reactive values to store data and API status
  const data: any = ref<I>() as Ref<I>;
  if (initialData) {
    data.value = initialData
  }
  const status = ref(IDLE);
  const error = ref(null);
  /**
   * Initialise the api request
   */

  const exec = async (...argsFunction: A) => {
    try {
      if (initialData) {
        data.value = initialData
      }
      else {
        data.value = undefined as I
      }
      // Clear current error value
      error.value = null;
      // API request starts
      status.value = PENDING;
      const response = await fn(...argsFunction);
      // Before assigning the response, check if a responseAdapter
      // was passed, if yes, then use it
      data.value =
        responseAdapter && typeof responseAdapter === "function"
          ? responseAdapter(response)
          : (response as unknown as I);
      // Done!
      status.value = SUCCESS;
    } catch (Localrror: any) {
      // Oops, there was an error
      error.value = Localrror;
      status.value = ERROR;
    }
  };
  return {
    data,
    status,
    error,
    exec,
    ...createNormalisedApiStatuses(status),
  };
};
