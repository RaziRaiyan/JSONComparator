import React, { useMemo, useState } from "react";
import { AlertCircle, Check, X, FileJson, RefreshCw } from "lucide-react";
import type { JsonValue } from "./types";
import { JsonViewer } from "./JSONTreeViewer";

import { Checkbox } from "radix-ui";
import { CheckIcon } from "@radix-ui/react-icons";

interface DiffResult {
  path: string;
  type: "added" | "removed" | "modified" | "equal";
  oldValue?: JsonValue;
  newValue?: JsonValue;
}

const JsonComparator: React.FC = () => {
  const [json1, setJson1] = useState("");
  const [json2, setJson2] = useState("");
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");
  const [isShowingDiffs, setIsShowingDiffs] = useState<boolean>(false);
  const [diffs, setDiffs] = useState<DiffResult[]>([]);
  const [showOnlyDiffs, setShowOnlyDiffs] = useState<boolean | "indeterminate">(
    false
  );

  const json1Parsed = useMemo(() => {
    const value = json1;
    try {
      const parsed = JSON.parse(value);
      return parsed;
    } catch (err) {
      console.log(err);
    }
  }, [json1]);

  const json2Parsed = useMemo(() => {
    const value = json2;
    try {
      const parsed = JSON.parse(value);
      return parsed;
    } catch (err) {
      console.log(err);
    }
  }, [json2]);

  const validateJson = (
    text: string,
    setError: (err: string) => void
  ): JsonValue | null => {
    try {
      if (!text.trim()) {
        setError("");
        return null;
      }
      const parsed = JSON.parse(text) as JsonValue;
      setError("");
      return parsed;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      return null;
    }
  };

  const compareObjects = (
    obj1: JsonValue,
    obj2: JsonValue,
    path: string = ""
  ): DiffResult[] => {
    const results: DiffResult[] = [];

    if (
      obj1 === null ||
      obj2 === null ||
      typeof obj1 !== "object" ||
      typeof obj2 !== "object"
    ) {
      if (obj1 !== obj2) {
        results.push({
          path: path || "root",
          type: "modified",
          oldValue: obj1,
          newValue: obj2,
        });
      } else {
        results.push({
          path: path || "root",
          type: "equal",
          oldValue: obj1,
          newValue: obj2,
        });
      }
      return results;
    }

    const obj1Record = obj1 as Record<string, JsonValue>;
    const obj2Record = obj2 as Record<string, JsonValue>;

    const keys1 = Object.keys(obj1Record);
    const keys2 = Object.keys(obj2Record);
    const allKeys = new Set([...keys1, ...keys2]);

    allKeys.forEach((key) => {
      const newPath = path ? `${path}.${key}` : key;
      const hasKey1 = key in obj1Record;
      const hasKey2 = key in obj2Record;

      if (!hasKey1) {
        results.push({
          path: newPath,
          type: "added",
          newValue: obj2Record[key],
        });
      } else if (!hasKey2) {
        results.push({
          path: newPath,
          type: "removed",
          oldValue: obj1Record[key],
        });
      } else {
        const val1 = obj1Record[key];
        const val2 = obj2Record[key];

        if (
          typeof val1 === "object" &&
          val1 !== null &&
          typeof val2 === "object" &&
          val2 !== null
        ) {
          results.push(...compareObjects(val1, val2, newPath));
        } else if (val1 !== val2) {
          results.push({
            path: newPath,
            type: "modified",
            oldValue: val1,
            newValue: val2,
          });
        } else {
          results.push({
            path: newPath,
            type: "equal",
            oldValue: val1,
            newValue: val2,
          });
        }
      }
    });

    return results;
  };

  const getStringDiffSpans = (oldStr: string, newStr: string) => {
    // find common prefix length
    const minLen = Math.min(oldStr.length, newStr.length);
    let prefix = 0;
    while (prefix < minLen && oldStr[prefix] === newStr[prefix]) prefix++;

    // find common suffix length (but do not overlap prefix)
    let suffix = 0;
    while (
      suffix < minLen - prefix &&
      oldStr[oldStr.length - 1 - suffix] === newStr[newStr.length - 1 - suffix]
    )
      suffix++;

    const oldMiddle = oldStr.slice(prefix, oldStr.length - suffix || undefined);
    const newMiddle = newStr.slice(prefix, newStr.length - suffix || undefined);
    const pre = oldStr.slice(0, prefix);
    const post = oldStr.slice(oldStr.length - suffix) || "";

    // return two JSX fragments: old and new (with different highlight styles)
    const oldNode = (
      <span className="font-mono text-sm break-words">
        <span>{pre}</span>
        <span className="bg-red-200 text-red-800 px-0.5 rounded">
          {oldMiddle}
        </span>
        <span>{post}</span>
      </span>
    );

    const newNode = (
      <span className="font-mono text-sm break-words">
        <span>{pre}</span>
        <span className="bg-green-200 text-green-800 px-0.5 rounded">
          {newMiddle}
        </span>
        <span>{post}</span>
      </span>
    );

    return { oldNode, newNode };
  };

  const renderValueWithHighlight = (
    value: JsonValue | undefined,
    peerValue?: JsonValue, // if provided and both are strings, highlight diffs
    role: "old" | "new" | "single" = "single"
  ): React.ReactNode => {
    // highlight when both values are strings
    if (typeof value === "string" && typeof peerValue === "string") {
      const { oldNode, newNode } = getStringDiffSpans(
        value as string,
        peerValue as string
      );
      return role === "old" ? oldNode : newNode;
    }

    // fallback for objects / arrays / null / numbers
    if (typeof value === "object" && value !== null) {
      return (
        <pre className="font-mono text-sm whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    if (value === null) return <span className="font-mono text-sm">null</span>;
    if (value === undefined)
      return <span className="font-mono text-sm">undefined</span>;
    if (typeof value === "string")
      return <span className="font-mono text-sm">"{value}"</span>;
    return <span className="font-mono text-sm">{String(value)}</span>;
  };

  const handleCompare = () => {
    const parsed1 = validateJson(json1, setError1);
    const parsed2 = validateJson(json2, setError2);

    if (parsed1 !== null && parsed2 !== null) {
      const differences = compareObjects(parsed1, parsed2);
      setDiffs(differences);
      setIsShowingDiffs(true);
    } else {
      setDiffs([]);
      setIsShowingDiffs(false);
    }
  };

  const formatValue = (value: JsonValue | undefined): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    if (typeof value === "string") return `"${value}"`;
    return String(value);
  };

  const getDiffIcon = (type: DiffResult["type"]) => {
    switch (type) {
      case "added":
        return <Check className="w-4 h-4 text-green-600" />;
      case "removed":
        return <X className="w-4 h-4 text-red-600" />;
      case "modified":
        return <RefreshCw className="w-4 h-4 text-amber-600" />;
      case "equal":
        return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDiffColor = (type: DiffResult["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-50 border-green-200";
      case "removed":
        return "bg-red-50 border-red-200";
      case "modified":
        return "bg-amber-50 border-amber-200";
      case "equal":
        return "bg-gray-50 border-gray-200";
    }
  };

  const getDiffLabel = (type: DiffResult["type"]) => {
    switch (type) {
      case "added":
        return "Added";
      case "removed":
        return "Removed";
      case "modified":
        return "Modified";
      case "equal":
        return "Equal";
    }
  };

  const handleClear = () => {
    setJson1("");
    setJson2("");
    setError1("");
    setError2("");
    setDiffs([]);
    setIsShowingDiffs(false);
  };

  const filteredDiffs = showOnlyDiffs
    ? diffs.filter((diff) => diff.type !== "equal")
    : diffs;

  const diffStats = {
    added: diffs.filter((d) => d.type === "added").length,
    removed: diffs.filter((d) => d.type === "removed").length,
    modified: diffs.filter((d) => d.type === "modified").length,
    equal: diffs.filter((d) => d.type === "equal").length,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 flex flex-col">
      <div className="mb-4 border border-gray-50 p-2 rounded-lg bg-white shadow-md flex flex-row justify-between">
        <FileJson className="w-10 h-10 text-blue-600" />

        <div className="flex gap-3">
          {isShowingDiffs ? (
            <button
              onClick={() => setIsShowingDiffs(false)}
              disabled={!json1.trim() || !json2.trim() || !!error1 || !!error2}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              Edit JSONs
            </button>
          ) : (
            <>
              <button
                onClick={handleCompare}
                disabled={
                  !json1.trim() || !json2.trim() || !!error1 || !!error2
                }
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                Compare JSON
              </button>
              <button
                onClick={handleClear}
                className="bg-slate-200 text-slate-7 py-3 px-6 rounded-lg font-semibold hover:bg-slate-300 transition-colors shadow-md"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-row flex-1">
        <div className="flex-1 flex flex-col max-h-full">
          <div className="flex gap-4 flex-row flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 flex-1 h-full min-h-fit max-w-[50%]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-700">JSON 1</h2>
                {error1 && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Invalid</span>
                  </div>
                )}
              </div>
              {isShowingDiffs ? (
                <JsonViewer data={json1Parsed} />
              ) : (
                <textarea
                  value={json1}
                  onChange={(e) => {
                    setJson1(e.target.value);
                    validateJson(e.target.value, setError1);
                  }}
                  placeholder='{"name": "John", "age": 30}'
                  className={`[&::selection]:bg-yellow-100 w-full text-black h-64 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 ${
                    error1
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-300 focus:ring-blue-500"
                  }`}
                  style={{ width: "100%", height: "calc(100% - 32px)" }}
                />
              )}
              {error1 && <p className="mt-2 text-sm text-red-600">{error1}</p>}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 flex-1 h-full min-h-fit max-w-[50%]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-slate-700">JSON 2</h2>
                {error2 && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Invalid</span>
                  </div>
                )}
              </div>
              {isShowingDiffs ? (
                <JsonViewer data={json2Parsed} />
              ) : (
                <textarea
                  value={json2}
                  onChange={(e) => {
                    setJson2(e.target.value);
                    validateJson(e.target.value, setError2);
                  }}
                  placeholder='{"name": "Jane", "age": 30, "city": "NYC"}'
                  className={`[&::selection]:bg-yellow-100 w-full text-black h-64 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 ${
                    error2
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-300 focus:ring-blue-500"
                  }`}
                  style={{ width: "100%", height: "calc(100% - 32px)" }}
                />
              )}
              {error2 && <p className="mt-2 text-sm text-red-600">{error2}</p>}
            </div>
          </div>
        </div>

        <div className="min-w-[550px] max-w-[550px]">
          <div className="bg-white rounded-lg shadow-md h-full">
            <div className="flex items-center justify-between px-6 py-3">
              <h2 className="text-xl font-semibold text-slate-800">
                Comparison Results
              </h2>

              <div className="flex items-center text-black gap-2">
                <Checkbox.Root
                  className="CheckboxRoot  h-5 w-5 rounded-sm bg-white-imp border border-black"
                  defaultChecked
                  id="c1"
                  checked={showOnlyDiffs}
                  onCheckedChange={(val) => setShowOnlyDiffs(val)}
                  style={{
                    padding: "0px",
                    background: "white",
                    border: "1px solid black",
                    borderRadius: "4px",
                  }}
                >
                  <Checkbox.Indicator className="CheckboxIndicator">
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label className="Label" htmlFor="c1">
                  Show only differences
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 px-6 py-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-700">
                  {diffStats.added}
                </div>
                <div className="text-sm text-green-600">Added</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-700">
                  {diffStats.removed}
                </div>
                <div className="text-sm text-red-600">Removed</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-700">
                  {diffStats.modified}
                </div>
                <div className="text-sm text-amber-600">Modified</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-700">
                  {diffStats.equal}
                </div>
                <div className="text-sm text-gray-600">Equal</div>
              </div>
            </div>

            <div
              className="space-y-2 px-6 py-3 overflow-auto"
              style={{ maxHeight: "calc(100vh - 210px)" }}
            >
              {filteredDiffs.map((diff, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getDiffColor(diff.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getDiffIcon(diff.type)}
                    <div className="flex-1 text-black">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm font-semibold text-slate-700">
                          {diff.path}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white rounded-full font-medium">
                          {getDiffLabel(diff.type)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {diff.type === "removed" && (
                          <div className="font-mono text-red-700">
                            <span className="text-red-500">- </span>
                            {typeof diff.oldValue === "string" &&
                            typeof diff.newValue === "string"
                              ? renderValueWithHighlight(
                                  diff.oldValue,
                                  diff.newValue,
                                  "old"
                                )
                              : renderValueWithHighlight(diff.oldValue)}
                          </div>
                        )}
                        {diff.type === "added" && (
                          <div className="font-mono text-green-700">
                            <span className="text-green-500">+ </span>
                            {typeof diff.oldValue === "string" &&
                            typeof diff.newValue === "string"
                              ? renderValueWithHighlight(
                                  diff.newValue,
                                  diff.oldValue,
                                  "new"
                                )
                              : renderValueWithHighlight(diff.newValue)}
                          </div>
                        )}
                        {diff.type === "modified" && (
                          <>
                            <div className="font-mono text-red-700">
                              <span className="text-red-500">- </span>
                              {typeof diff.oldValue === "string" &&
                              typeof diff.newValue === "string"
                                ? renderValueWithHighlight(
                                    diff.oldValue,
                                    diff.newValue,
                                    "old"
                                  )
                                : renderValueWithHighlight(diff.oldValue)}
                            </div>
                            <div className="font-mono text-green-700">
                              <span className="text-green-500">+ </span>
                              {typeof diff.oldValue === "string" &&
                              typeof diff.newValue === "string"
                                ? renderValueWithHighlight(
                                    diff.newValue,
                                    diff.oldValue,
                                    "new"
                                  )
                                : renderValueWithHighlight(diff.newValue)}
                            </div>
                          </>
                        )}
                        {diff.type === "equal" && (
                          <div className="font-mono text-gray-600">
                            {formatValue(diff.oldValue)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonComparator;
