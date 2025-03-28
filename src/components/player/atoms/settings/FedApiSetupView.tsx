import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { Menu } from "@/components/player/internals/ContextMenu";
import {
  StatusCircle,
  StatusCircleProps,
} from "@/components/player/internals/StatusCircle";
import { MwLink } from "@/components/text/Link";
import { AuthInputBox } from "@/components/text-inputs/AuthInputBox";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { Status, testFebboxToken } from "@/pages/parts/settings/SetupPart";
import { useAuthStore } from "@/stores/auth";

async function getFebboxTokenStatus(febboxToken: string | null) {
  if (febboxToken) {
    const status: Status = await testFebboxToken(febboxToken);
    return status;
  }
  return "unset";
}

export function FedApiSetupView({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const febboxToken = useAuthStore((s) => s.febboxToken);
  const setFebboxToken = useAuthStore((s) => s.setFebboxToken);
  const [showVideo, setShowVideo] = useState(false);
  const [status, setStatus] = useState<Status>("unset");
  const statusMap: Record<Status, StatusCircleProps["type"]> = {
    error: "error",
    success: "success",
    unset: "noresult",
  };

  useEffect(() => {
    const checkTokenStatus = async () => {
      const result = await getFebboxTokenStatus(febboxToken);
      setStatus(result);
    };
    checkTokenStatus();
  }, [febboxToken]);

  const handleReload = () => {
    window.location.reload();
  };

  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((status === "success" || status === "error") && alertRef.current) {
      alertRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [status]);

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/source")}>
        FED API Setup
      </Menu.BackLink>
      <Menu.Section className="pb-4">
        <div className="my-3">
          <p className="max-w-[30rem] font-medium">
            <Trans i18nKey="settings.connections.febbox.description">
              To get your UI token:
              <br />
              <div
                onClick={() => setShowVideo(!showVideo)}
                className="flex items-center justify-between p-1 px-2 my-2 w-fit border border-type-secondary rounded-lg cursor-pointer text-type-secondary hover:text-white transition-colors duration-200"
              >
                <span className="text-sm">
                  {showVideo ? "Hide Video Tutorial" : "Show Video Tutorial"}
                </span>
                {showVideo ? (
                  <Icon icon={Icons.CHEVRON_UP} className="pl-1" />
                ) : (
                  <Icon icon={Icons.CHEVRON_DOWN} className="pl-1" />
                )}
              </div>
              {showVideo && (
                <>
                  <div className="relative pt-[56.25%] mt-2">
                    <iframe
                      src="https://player.vimeo.com/video/1059834885?h=c3ab398d42&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                      className="absolute top-0 left-0 w-full h-full border border-type-secondary rounded-lg bg-black"
                      title="P-Stream FED API Setup Tutorial"
                    />
                  </div>
                  <br />
                </>
              )}
              1. Go to <MwLink url="https://febbox.com">febbox.com</MwLink> and
              log in with Google (use a fresh account!)
              <br />
              2. Open DevTools or inspect the page
              <br />
              3. Go to Application tab → Cookies
              <br />
              4. Copy the &quot;ui&quot; cookie.
              <br />
              5. Close the tab, but do NOT logout!
            </Trans>
          </p>
          <p className="text-type-danger mt-2">(Do not share this token!)</p>
        </div>

        <div className="mt-6">
          <p className="text-white font-bold mb-3">
            {t("settings.connections.febbox.tokenLabel", "Token")}
          </p>
          <div className="flex items-center w-full">
            <StatusCircle type={statusMap[status]} className="mx-2 mr-4" />
            <AuthInputBox
              onChange={(newToken) => {
                setFebboxToken(newToken);
              }}
              value={febboxToken ?? ""}
              placeholder="eyABCdE..."
              passwordToggleable
              className="flex-grow"
            />
          </div>
          {status === "error" && (
            <p ref={alertRef} className="text-type-danger mt-4">
              Failed to fetch a &quot;VIP&quot; stream. Token is invalid or API
              is down!
            </p>
          )}
          {status === "success" && (
            <div ref={alertRef} className="mt-4">
              <Button theme="purple" onClick={handleReload}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </Menu.Section>
    </>
  );
}
