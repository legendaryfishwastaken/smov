import classNames from "classnames";
<<<<<<< Updated upstream
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
=======
import Fuse from "fuse.js";
import { useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
>>>>>>> Stashed changes

import { getAllProviders, getProviders } from "@/backend/providers/providers";
import { Button } from "@/components/buttons/Button";
import { Toggle } from "@/components/buttons/Toggle";
import { FlagIcon } from "@/components/FlagIcon";
import { Dropdown } from "@/components/form/Dropdown";
import { SortableList } from "@/components/form/SortableList";
import { Icon, Icons } from "@/components/Icon";
import { Heading1 } from "@/components/utils/Text";
import { appLanguageOptions } from "@/setup/i18n";
import { isAutoplayAllowed } from "@/utils/autoplay";
import { getLocaleInfo, sortLangCodes } from "@/utils/language";

export function PreferencesPart(props: {
  language: string;
  setLanguage: (l: string) => void;
  enableThumbnails: boolean;
  setEnableThumbnails: (v: boolean) => void;
  enableAutoplay: boolean;
  setEnableAutoplay: (v: boolean) => void;
  sourceOrder: string[];
  setSourceOrder: (v: string[]) => void;
  enableSourceOrder: boolean;
  setEnableSourceOrder: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const sorted = sortLangCodes(appLanguageOptions.map((item) => item.code));
  const [languageSearch, setLanguageSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { setLanguage } = props;

  const allowAutoplay = isAutoplayAllowed();

  const options = useMemo(() => {
    const baseOptions = appLanguageOptions
      .sort((a, b) => sorted.indexOf(a.code) - sorted.indexOf(b.code))
      .map((opt) => ({
        id: opt.code,
        name: `${opt.nativeName}${opt.nativeName ? ` — ${opt.name}` : ""}`,
        leftIcon: <FlagIcon langCode={opt.code} />,
      }));

    if (languageSearch.trim().length > 0) {
      const fuse = new Fuse(baseOptions, {
        includeScore: true,
        keys: ["name"],
      });

      const searchResults = fuse.search(languageSearch).map((res) => res.item);
      if (searchResults.length > 0) {
        setLanguage(searchResults[0].id);
      }
      return searchResults;
    }

    return baseOptions;
  }, [sorted, languageSearch, setLanguage]);

  const selected =
    options.find((item) => item.id === getLocaleInfo(props.language)?.code) ||
    options[0];

  const allSources = getAllProviders().listSources();

  const sourceItems = useMemo(() => {
    const currentDeviceSources = getProviders().listSources();
    return props.sourceOrder.map((id) => ({
      id,
      name: allSources.find((s) => s.id === id)?.name || id,
      disabled: !currentDeviceSources.find((s) => s.id === id),
    }));
  }, [props.sourceOrder, allSources]);

  return (
    <div className="space-y-12">
      <Heading1 border>{t("settings.preferences.title")}</Heading1>
<<<<<<< Updated upstream
      <div>
        <p className="text-white font-bold mb-3">
          {t("settings.preferences.language")}
        </p>
        <p className="max-w-[20rem] font-medium">
          {t("settings.preferences.languageDescription")}
        </p>
        <Dropdown
          options={options}
          selectedItem={selected || options[0]}
          setSelectedItem={(opt) => props.setLanguage(opt.id)}
        />
      </div>
=======
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column */}
        <div className="space-y-8">
          {/* Language Preference */}
          <div>
            <p className="text-white font-bold mb-3">
              {t("settings.preferences.language")}
            </p>
            <p className="max-w-[20rem] font-medium">
              {t("settings.preferences.languageDescription")}
            </p>

            {/* Combined search and dropdown */}
            <div className="flex my-4 gap-2 items-center max-w-[25rem]">
              <div
                className={classNames(
                  "relative transition-all duration-200 ease-in-out hidden md:block",
                  isSearchFocused ? "w-full" : "w-6 mr-8", // needs to stay a fixed size w-6 when colapsed
                )}
              >
                <Icon
                  className="pointer-events-none absolute top-1/2 left-4 transform -translate-y-1/2 text-search-icon"
                  icon={Icons.SEARCH}
                />
                <input
                  ref={searchInputRef}
                  placeholder={
                    t("settings.preferences.languageSearch") ||
                    "Search languages"
                  }
                  className={classNames(
                    "py-3 rounded-full tabbable bg-dropdown-background hover:bg-dropdown-hoverBackground px-3 placeholder:text-dropdown-secondary text-white transition-all duration-200 ease-in-out",
                    isSearchFocused
                      ? "pl-[calc(0.75rem+30px)]"
                      : "w-10 cursor-pointer pl-[calc(0.75rem+25px)]", // these padding options are for the start of the text so it doesnt overlap the search icon, but they could comflict?
                  )}
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>

              <div
                className={classNames(
                  "transition-all duration-200 ease-in-out",
                  isSearchFocused ? "w-[90px]" : "w-full", // needs to say fixed at 90px when colapsed
                )}
              >
                <Dropdown
                  options={options}
                  selectedItem={selected}
                  setSelectedItem={(opt) => setLanguage(opt.id)}
                />
              </div>
            </div>
          </div>
>>>>>>> Stashed changes

      <div>
        <p className="text-white font-bold mb-3">
          {t("settings.preferences.thumbnail")}
        </p>
        <p className="max-w-[25rem] font-medium">
          {t("settings.preferences.thumbnailDescription")}
        </p>
        <div
          onClick={() => props.setEnableThumbnails(!props.enableThumbnails)}
          className="bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg"
        >
          <Toggle enabled={props.enableThumbnails} />
          <p className="flex-1 text-white font-bold">
            {t("settings.preferences.thumbnailLabel")}
          </p>
        </div>
      </div>
      <div>
        <p className="text-white font-bold mb-3">
          {t("settings.preferences.autoplay")}
        </p>
        <p className="max-w-[25rem] font-medium">
          {t("settings.preferences.autoplayDescription")}
        </p>
        <div
          onClick={() =>
            allowAutoplay
              ? props.setEnableAutoplay(!props.enableAutoplay)
              : null
          }
          className={classNames(
            "bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg",
            allowAutoplay
              ? "cursor-pointer opacity-100 pointer-events-auto"
              : "cursor-not-allowed opacity-50 pointer-events-none",
          )}
        >
          <Toggle enabled={props.enableAutoplay && allowAutoplay} />
          <p className="flex-1 text-white font-bold">
            {t("settings.preferences.autoplayLabel")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-white font-bold">
          {t("settings.preferences.sourceOrder")}
        </p>
        <p className="max-w-[25rem] font-medium">
          {t("settings.preferences.sourceOrderDescription")}
        </p>
        <div
          onClick={() => props.setEnableSourceOrder(!props.enableSourceOrder)}
          className="bg-dropdown-background hover:bg-dropdown-hoverBackground select-none my-4 cursor-pointer space-x-3 flex items-center max-w-[25rem] py-3 px-4 rounded-lg"
        >
          <Toggle enabled={props.enableSourceOrder} />
          <p className="flex-1 text-white font-bold">
            {t("settings.preferences.sourceOrderEnableLabel")}
          </p>
        </div>

        {props.enableSourceOrder && (
          <div className="w-full flex flex-col gap-4">
            <SortableList
              items={sourceItems}
              setItems={(items) =>
                props.setSourceOrder(items.map((item) => item.id))
              }
            />
            <Button
              className="max-w-[25rem]"
              theme="secondary"
              onClick={() => props.setSourceOrder(allSources.map((s) => s.id))}
            >
              {t("settings.reset")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
