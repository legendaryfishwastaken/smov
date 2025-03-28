import { useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Icons } from "@/components/Icon";
import { IconPill } from "@/components/layout/IconPill";
import { useModal } from "@/components/overlays/Modal";
import { Paragraph } from "@/components/text/Paragraph";
import { Title } from "@/components/text/Title";
import { ErrorContainer, ErrorLayout } from "@/pages/layouts/ErrorLayout";
import { usePlayerStore } from "@/stores/player/store";

import { ErrorCardInModal } from "../errors/ErrorCard";

export function PlaybackErrorPart() {
  const { t } = useTranslation();
  const playbackError = usePlayerStore((s) => s.interface.error);
  const modal = useModal("error");

  return (
    <ErrorLayout>
      <ErrorContainer>
        <IconPill icon={Icons.WAND}>{t("player.playbackError.badge")}</IconPill>
        <Title>{t("player.playbackError.title")}</Title>
        <Paragraph>{t("player.playbackError.text")}</Paragraph>
        <div className="flex gap-3">
          {(() => {
            const backlink = new URLSearchParams(window.location.search).get(
              "backlink",
            );

            // Only show backlink if it comes from URL parameter, and strip any quotes
            if (backlink) {
              // Remove any surrounding quotes from the URL
              const cleanUrl = backlink.replace(/^["'](.*)["']$/, "$1");

              return (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    window.parent.location.href = cleanUrl;
                  }}
                  theme="secondary"
                  padding="md:px-12 p-2.5"
                  className="mt-6"
                >
                  {t("player.scraping.notFound.homeButton")}
                </Button>
              );
            }
            return null;
          })()}
        </div>
        <Button
          theme="secondary"
          padding="md:px-12 p-2.5"
          className="mt-6"
          onClick={() => window.location.reload()}
        >
          {t("errors.reloadPage")}
        </Button>
      </ErrorContainer>
      {/* Error */}
      <ErrorCardInModal
        onClose={() => modal.hide()}
        error={playbackError}
        id={modal.id}
      />
    </ErrorLayout>
  );
}
