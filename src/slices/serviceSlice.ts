import { ServiceType } from "../models/services/types/serviceType";
import { ServiceYear } from "../models/services/types/serviceYear";

export interface ServicePrice {
  year?: ServiceYear;
  type: ServiceType;
  price: number;
}

export interface ServiceDiscount {
  year: ServiceYear;
  discount: number;
}

export interface ServiceRelations {
  extraService: ServiceType;
  mainServices: ServiceType[];
}

export interface ServiceState {
  servicePrice: ServicePrice[];
  serviceDiscounts: ServiceDiscount[];
  serviceExtraDiscounts: ServiceDiscount[];
  serviceRelations: ServiceRelations[];
}

const initialState: ServiceState = {
  servicePrice: [
    { type: ServiceType.Photography, year: 2020, price: 1700 },
    { type: ServiceType.Photography, year: 2021, price: 1800 },
    { type: ServiceType.Photography, year: 2022, price: 1900 },
    { type: ServiceType.VideoRecording, year: 2020, price: 1700 },
    { type: ServiceType.VideoRecording, year: 2021, price: 1800 },
    { type: ServiceType.VideoRecording, year: 2022, price: 1900 },
    { type: ServiceType.WeddingSession, year: 2020, price: 600 },
    { type: ServiceType.WeddingSession, year: 2021, price: 600 },
    { type: ServiceType.WeddingSession, year: 2022, price: 600 },
    { type: ServiceType.BlurayPackage, price: 300 },
    { type: ServiceType.TwoDayEvent, price: 400 },
  ],
  serviceDiscounts: [
    { year: 2020, discount: 1200 },
    { year: 2021, discount: 1300 },
    { year: 2022, discount: 1300 },
  ],
  serviceExtraDiscounts: [
    { year: 2020, discount: 300 },
    { year: 2021, discount: 300 },
    { year: 2022, discount: 300 },
  ],
  serviceRelations: [
    {
      extraService: ServiceType.BlurayPackage,
      mainServices: [ServiceType.VideoRecording],
    },
    {
      extraService: ServiceType.TwoDayEvent,
      mainServices: [ServiceType.Photography, ServiceType.VideoRecording],
    },
  ],
};

export const selectServicePrice = (type: ServiceType, year?: ServiceYear) =>
  initialState.servicePrice.find((serivce) => serivce.type === type && serivce.year === year)
    ?.price;

export const selectServiceDiscount = (year: ServiceYear) =>
  initialState.serviceDiscounts.find((discount) => discount.year === year)?.discount;

export const selectMainServicesByExtraService = (type: ServiceType) =>
  initialState.serviceRelations.find((service) => service.extraService === type)?.mainServices;

export const isExtraService = (type: ServiceType) =>
  initialState.serviceRelations.some((service) => service.extraService === type);

export const selectExtraServices = () =>
  initialState.serviceRelations.map((services) => services.extraService);

export const selectExtraServiceDiscount = (services: ServiceType[], year: ServiceYear) => {
  let discount = initialState.serviceExtraDiscounts.find(
    (discount) => discount.year === year
  )?.discount;

  if (year === 2022 && services.includes(ServiceType.Photography)) discount += 300;

  return discount;
};
