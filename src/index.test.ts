import { updateSelectedServices, calculatePrice } from ".";
import { ServiceAction } from "./models/services/types/serviceAction";
import { ServiceType } from "./models/services/types/serviceType";
import { ServiceYear } from "./models/services/types/serviceYear";

describe("updateSelectedServices.select", () => {
  test("should select when not selected", () => {
    const result = updateSelectedServices([], {
      type: ServiceAction.Select,
      service: ServiceType.Photography,
    });
    expect(result).toEqual([ServiceType.Photography]);
  });

  test("should not select the same service twice", () => {
    const result = updateSelectedServices([ServiceType.Photography], {
      type: ServiceAction.Select,
      service: ServiceType.Photography,
    });
    expect(result).toEqual([ServiceType.Photography]);
  });

  test("should not select related service when main service is not selected", () => {
    const result = updateSelectedServices([ServiceType.WeddingSession], {
      type: ServiceAction.Select,
      service: ServiceType.BlurayPackage,
    });
    expect(result).toEqual([ServiceType.WeddingSession]);
  });

  test("should select related service when main service is selected", () => {
    const result = updateSelectedServices(
      [ServiceType.WeddingSession, ServiceType.VideoRecording],
      {
        type: ServiceAction.Select,
        service: ServiceType.BlurayPackage,
      }
    );
    expect(result).toEqual([
      ServiceType.WeddingSession,
      ServiceType.VideoRecording,
      ServiceType.BlurayPackage,
    ]);
  });

  test("should select related service when one of main services is selected", () => {
    const result = updateSelectedServices(
      [ServiceType.WeddingSession, ServiceType.Photography],
      {
        type: ServiceAction.Select,
        service: ServiceType.TwoDayEvent,
      }
    );
    expect(result).toEqual([
      ServiceType.WeddingSession,
      ServiceType.Photography,
      ServiceType.TwoDayEvent,
    ]);
  });
});

describe("updateSelectedServices.deselect", () => {
  test("should deselect", () => {
    const result = updateSelectedServices(
      [ServiceType.WeddingSession, ServiceType.Photography],
      {
        type: ServiceAction.Deselect,
        service: ServiceType.Photography,
      }
    );
    expect(result).toEqual([ServiceType.WeddingSession]);
  });

  test("should do nothing when service not selected", () => {
    const result = updateSelectedServices(
      [ServiceType.WeddingSession, ServiceType.Photography],
      {
        type: ServiceAction.Deselect,
        service: ServiceType.TwoDayEvent,
      }
    );
    expect(result).toEqual([
      ServiceType.WeddingSession,
      ServiceType.Photography,
    ]);
  });

  test("should deselect related when last main service deselected", () => {
    const result = updateSelectedServices(
      [
        ServiceType.WeddingSession,
        ServiceType.Photography,
        ServiceType.TwoDayEvent,
      ],
      {
        type: ServiceAction.Deselect,
        service: ServiceType.Photography,
      }
    );
    expect(result).toEqual([ServiceType.WeddingSession]);
  });

  test("should not deselect related when at least one main service stays selected", () => {
    const result = updateSelectedServices(
      [
        ServiceType.WeddingSession,
        ServiceType.Photography,
        ServiceType.VideoRecording,
        ServiceType.TwoDayEvent,
      ],
      {
        type: ServiceAction.Deselect,
        service: ServiceType.Photography,
      }
    );
    expect(result).toEqual([
      ServiceType.WeddingSession,
      ServiceType.VideoRecording,
      ServiceType.TwoDayEvent,
    ]);
  });
});

describe.each([2020, 2021, 2022])(
  "calculatePrice.zero (%i)",
  (year: ServiceYear) => {
    test("should be zero with no services selected", () => {
      const result = calculatePrice([], year);
      expect(result).toEqual({ basePrice: 0, finalPrice: 0 });
    });
  }
);

describe.each([
  [ServiceType.WeddingSession, 2020, 600],
  [ServiceType.WeddingSession, 2021, 600],
  [ServiceType.WeddingSession, 2022, 600],
  [ServiceType.Photography, 2020, 1700],
  [ServiceType.Photography, 2021, 1800],
  [ServiceType.Photography, 2022, 1900],
  [ServiceType.VideoRecording, 2020, 1700],
  [ServiceType.VideoRecording, 2021, 1800],
  [ServiceType.VideoRecording, 2022, 1900],
])(
  "calculatePrice.singleService (%s, %i)",
  (service: ServiceType, year: ServiceYear, expectedPrice) => {
    test("no discount applied", () => {
      const result = calculatePrice([service], year);
      expect(result.basePrice).toBeGreaterThan(0);
      expect(result.finalPrice).toBeGreaterThan(0);
      expect(result.basePrice).toBe(result.finalPrice);
    });

    test("price matches requirements", () => {
      const result = calculatePrice([service], year);
      expect(result).toEqual({
        basePrice: expectedPrice,
        finalPrice: expectedPrice,
      });
    });
  }
);

describe.each([
  [2020, 300],
  [2021, 300],
  [2022, 0],
])(
  "calcularePrice.photographyWithWeddingSessionPrice (%i increase by %i)",
  (year: ServiceYear, increase) => {
    test("price matches requirements", () => {
      const withoutSession = calculatePrice([ServiceType.Photography], year);
      const withSession = calculatePrice(
        [ServiceType.Photography, ServiceType.WeddingSession],
        year
      );

      const priceChangeWithSession =
        withSession.finalPrice - withoutSession.finalPrice;

      expect(withSession.basePrice).toBeGreaterThan(0);
      expect(withSession.finalPrice).toBeGreaterThan(0);
      expect(priceChangeWithSession).toEqual(increase);
    });

    test("discount applied", () => {
      const withoutSession = calculatePrice([ServiceType.Photography], year);
      const onlySession = calculatePrice([ServiceType.WeddingSession], year);
      const withSession = calculatePrice(
        [ServiceType.Photography, ServiceType.WeddingSession],
        year
      );

      const priceWithoutDiscounts =
        withoutSession.finalPrice + onlySession.finalPrice;

      expect(priceWithoutDiscounts).toBeGreaterThan(withSession.finalPrice);
    });
  }
);

describe.each([
  [2020, 300],
  [2021, 300],
  [2022, 300],
])(
  "calcularePrice.videoRecordingWithWeddingSessionPrice (%i increase by %i)",
  (year: ServiceYear, increase) => {
    test("price matches requirements", () => {
      const withoutSession = calculatePrice([ServiceType.VideoRecording], year);
      const withSession = calculatePrice(
        [ServiceType.VideoRecording, ServiceType.WeddingSession],
        year
      );

      const priceChangeWithSession =
        withSession.finalPrice - withoutSession.finalPrice;

      expect(priceChangeWithSession).toEqual(increase);
    });

    test("discount applied", () => {
      const withoutSession = calculatePrice([ServiceType.VideoRecording], year);
      const onlySession = calculatePrice([ServiceType.WeddingSession], year);
      const withSession = calculatePrice(
        [ServiceType.VideoRecording, ServiceType.WeddingSession],
        year
      );

      const priceWithoutDiscounts =
        withoutSession.finalPrice + onlySession.finalPrice;

      expect(priceWithoutDiscounts).toBeGreaterThan(withSession.finalPrice);
    });
  }
);

describe.each([
  [2020, 500],
  [2021, 500],
  [2022, 600],
])(
  "calcularePrice.videoRecordingWithPhotographyPrice (%i increase by %i)",
  (year: ServiceYear, increase) => {
    test("price matches requirements", () => {
      const withoutPhotography = calculatePrice(
        [ServiceType.VideoRecording],
        year
      );
      const withPhotography = calculatePrice(
        [ServiceType.VideoRecording, ServiceType.Photography],
        year
      );

      const priceChangeWithPhotography =
        withPhotography.finalPrice - withoutPhotography.finalPrice;

      expect(priceChangeWithPhotography).toEqual(increase);
    });

    test("discount applied", () => {
      const withoutPhotography = calculatePrice(
        [ServiceType.VideoRecording],
        year
      );
      const onlyPhotography = calculatePrice([ServiceType.Photography], year);
      const withPhotography = calculatePrice(
        [ServiceType.VideoRecording, ServiceType.Photography],
        year
      );

      const priceWithoutDiscounts =
        withoutPhotography.finalPrice + onlyPhotography.finalPrice;

      expect(priceWithoutDiscounts).toBeGreaterThan(withPhotography.finalPrice);
    });
  }
);

describe.each([
  [2020, 300],
  [2021, 300],
  [2022, 0],
])(
  "calcularePrice.videoRecordingWithPhotographyWithSessionPrice (%i increase by %i)",
  (year: ServiceYear, increase) => {
    test("price matches requirements", () => {
      const withoutSession = calculatePrice(
        [ServiceType.VideoRecording, ServiceType.Photography],
        year
      );
      const withSession = calculatePrice(
        [
          ServiceType.VideoRecording,
          ServiceType.Photography,
          ServiceType.WeddingSession,
        ],
        year
      );

      const priceChangeWithSession =
        withSession.finalPrice - withoutSession.finalPrice;

      expect(withSession.basePrice).toBeGreaterThan(0);
      expect(withSession.finalPrice).toBeGreaterThan(0);
      expect(priceChangeWithSession).toEqual(increase);
    });

    test("discount applied", () => {
      const withoutSession = calculatePrice(
        [ServiceType.VideoRecording, ServiceType.Photography],
        year
      );
      const onlySession = calculatePrice([ServiceType.WeddingSession], year);
      const withSession = calculatePrice(
        [
          ServiceType.VideoRecording,
          ServiceType.Photography,
          ServiceType.WeddingSession,
        ],
        year
      );

      const priceWithoutDiscounts =
        withoutSession.finalPrice + onlySession.finalPrice;

      expect(priceWithoutDiscounts).toBeGreaterThan(withSession.finalPrice);
    });
  }
);
