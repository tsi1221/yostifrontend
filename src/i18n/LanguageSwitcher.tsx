import { GlobalOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";

import { SUPPORTED_LANGUAGES, isAppLanguage } from "./index";

interface LanguageSwitcherProps {
  variant?: "navbar" | "drawer";
}

export default function LanguageSwitcher({
  variant = "navbar",
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const current = isAppLanguage(i18n.resolvedLanguage ?? i18n.language)
    ? (i18n.resolvedLanguage ?? i18n.language)
    : "en";

  const items: MenuProps["items"] = SUPPORTED_LANGUAGES.map((language) => ({
    key: language.code,
    label: (
      <span className="font-medium">
        {t(`languages.${language.code}`)}
      </span>
    ),
  }));

  const handleSelect: MenuProps["onClick"] = ({ key }) => {
    if (isAppLanguage(key)) {
      void i18n.changeLanguage(key);
    }
  };

  if (variant === "drawer") {
    return (
      <div>
        <div className="mb-2 text-sm font-semibold text-yellow-500">
          {t("nav.selectLanguage")}
        </div>

        <div className="flex flex-col gap-1">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => void i18n.changeLanguage(language.code)}
              className={`
                rounded-lg
                px-3
                py-2
                text-left
                text-sm
                transition
                ${
                  current === language.code
                    ? "bg-yellow-500/20 font-semibold text-yellow-400"
                    : "text-yellow-500 hover:bg-white/5 hover:text-yellow-400"
                }
              `}
            >
              {t(`languages.${language.code}`)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Dropdown
      menu={{
        items,
        onClick: handleSelect,
        selectedKeys: [current],
      }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button
        type="text"
        aria-label={t("nav.selectLanguage")}
        className="flex items-center !text-yellow-500 hover:!text-yellow-400"
      >
        <GlobalOutlined />
        <span className="ml-1 font-semibold">
          {t(`languages.${current}`)}
        </span>
      </Button>
    </Dropdown>
  );
}
