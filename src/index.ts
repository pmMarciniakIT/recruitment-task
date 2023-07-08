import { ServiceAction } from "./models/services/types/serviceAction";
import { ServiceType } from "./models/services/types/serviceType";
import { ServiceYear } from "./models/services/types/serviceYear";
import {
  isExtraService,
  selectExtraServiceDiscount,
  selectExtraServices,
  selectMainServicesByExtraService,
  selectServiceDiscount,
  selectServicePrice,
} from "./slices/serviceSlice";

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
  let basePrice: number = 0;
  let discount: number = 0;

  selectedServices.forEach((service) => {
    basePrice += selectServicePrice(service, selectedYear);
  });

  if (isServiceDiscount(selectedServices)) discount += selectServiceDiscount(selectedYear);

  if (isExtraServiceDiscount(selectedServices))
    discount += selectExtraServiceDiscount(selectedServices, selectedYear);

  return { basePrice: basePrice, finalPrice: basePrice - discount };
};

export const updateSelectedServices = (
  selectedServices: ServiceType[],
  action: { type: ServiceAction; service: ServiceType }
) => {
  switch (action.type) {
    case ServiceAction.Select:
      return addService(selectedServices, action.service);
    case ServiceAction.Deselect:
      return removeService(selectedServices, action.service);
    default:
      return selectedServices;
  }
};

const addService = (services: ServiceType[], addedService: ServiceType) => {
  if (services.includes(addedService)) return services;

  if (isExtraService(addedService) && !isMainServiceInSelected(addedService, services))
    return services;

  services.push(addedService);

  return services;
};

const removeService = (services: ServiceType[], removedService: ServiceType) => {
  services = [...services.filter((service) => service != removedService)];
  services = removeExtraServiceIfMainServiceDoesntExists(services);

  return services;
};

const isMainServiceInSelected = (extraService: ServiceType, selectedServices: ServiceType[]) => {
  let mainServices = selectMainServicesByExtraService(extraService);
  return selectedServices.some((service) => mainServices.includes(service));
};

const removeExtraServiceIfMainServiceDoesntExists = (services: ServiceType[]) => {
  let extraServices = selectExtraServices();

  extraServices.forEach((extraService) => {
    if (services.includes(extraService) && !isMainServiceInSelected(extraService, services))
      services = [...services.filter((service) => service != extraService)];
  });

  return services;
};

const isServiceDiscount = (services: ServiceType[]) =>
  services.includes(ServiceType.Photography) && services.includes(ServiceType.VideoRecording);

const isExtraServiceDiscount = (services: ServiceType[]) =>
  services.includes(ServiceType.WeddingSession) &&
  (services.includes(ServiceType.Photography) || services.includes(ServiceType.VideoRecording));
