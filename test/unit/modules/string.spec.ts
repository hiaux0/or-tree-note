import {
  filterListByCharSequence,
  filterStringByCharSequence,
} from "modules/string/string";

describe("filterListByCharSequence", () => {
  const inputList = ["foo", "for", "faz", "flo", "z", "ga"];

  it("Should return multiple items", () => {
    expect(filterListByCharSequence(inputList, "fo")).toEqual(["foo", "for"]);
  });
  it("Should return one result - 1", () => {
    expect(filterListByCharSequence(inputList, "z")).toEqual(["z"]);
  });
  it("Should return one result - 2", () => {
    expect(filterListByCharSequence(inputList, "ga")).toEqual(["ga"]);
  });
});

describe("filterStringByCharSequence", () => {
  it("Should return one result - 1", () => {
    const input = "z";
    expect(filterStringByCharSequence(input, "z")).toBeTrue();
  });
  it("Should return one result - 2", () => {
    const input = "foo";
    expect(filterStringByCharSequence(input, "fo")).toBeTrue();
  });
  it("Should not return when no match", () => {
    const input = "bar";
    expect(filterStringByCharSequence(input, "br")).toBeFalse();
  });
});
