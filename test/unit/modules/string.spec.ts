import {
  filterListByCharSequence,
  inputContainsSequence,
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
    expect(inputContainsSequence(input, "z")).toBeTrue();
  });
  it("Should return one result - 2", () => {
    const input = "foo";
    expect(inputContainsSequence(input, "fo")).toBeTrue();
  });
  it("Should not return when no match", () => {
    const input = "bar";
    expect(inputContainsSequence(input, "br")).toBeFalse();
  });
});
