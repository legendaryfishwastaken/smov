import React, { useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";

import { get } from "@/backend/metadata/tmdb";
import { conf } from "@/setup/config";
import { MediaItem } from "@/utils/mediaTypes";

import { EpisodeSelector } from "./ModalEpisodeSelector";
import { Button } from "../buttons/Button";
import { Icon, Icons } from "../Icon";

interface PopupModalProps {
  isVisible: boolean;
  onClose: () => void;
  playingTitle: {
    id: string;
    type: string;
  };
  media: MediaItem;
}

interface MediaData {
  backdrop_path?: string;
  title?: string;
  name?: string;
  runtime?: number;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genres?: Array<{ name: string }>;
  overview?: string;
}

interface MediaInfo {
  results?: Array<{
    iso_3166_1: string;
    rating?: string;
    release_dates?: Array<{
      certification: string;
      release_date: string;
    }>;
  }>;
}

type StyleState = {
  opacity: number;
  visibility: "visible" | "hidden" | undefined;
};

function formatRuntime(runtime: number) {
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function PopupModal({
  isVisible,
  onClose,
  playingTitle,
  media,
}: PopupModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<StyleState>({
    opacity: 0,
    visibility: "hidden",
  });
  const [data, setData] = useState<MediaData | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      setStyle({ opacity: 1, visibility: "visible" });
    } else {
      setStyle({ opacity: 0, visibility: "hidden" });
    }
  }, [isVisible]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isVisible) return;

      try {
        const mediaTypePath = media.type === "show" ? "tv" : media.type;
        const result = await get<MediaData>(`/${mediaTypePath}/${media.id}`, {
          api_key: conf().TMDB_READ_API_KEY,
          language: "en-US",
        });
        setData(result);
        setError(null);
      } catch (err) {
        setError("Failed to fetch media data");
        console.error(err);
      }
    };

    fetchData();
  }, [media.id, media.type, isVisible]);

  useEffect(() => {
    const fetchContentRatingsOrReleaseDates = async () => {
      if (!isVisible || (media.type !== "show" && media.type !== "movie"))
        return;

      try {
        const mediaTypeForAPI = media.type === "show" ? "tv" : media.type;
        const endpointSuffix =
          media.type === "show" ? "content_ratings" : "release_dates";
        const result = await get<MediaInfo>(
          `/${mediaTypeForAPI}/${media.id}/${endpointSuffix}`,
          {
            api_key: conf().TMDB_READ_API_KEY,
            language: "en-US",
          },
        );
        setMediaInfo(result);
        setError(null);
      } catch (err) {
        setError("Failed to fetch content ratings or release dates");
        console.error(err);
      }
    };

    fetchContentRatingsOrReleaseDates();
  }, [media.id, media.type, isVisible]);

  if (!isVisible && style.visibility === "hidden") return null;
  if (error) return <div>Error: {error}</div>;

  const isTVShow = media.type === "show";
  const usReleaseInfo = mediaInfo?.results?.find(
    (result: any) => result.iso_3166_1 === "US",
  );
  const certifiedReleases =
    usReleaseInfo?.release_dates?.filter((date: any) => date.certification) ||
    [];
  const relevantRelease =
    certifiedReleases.length > 0
      ? certifiedReleases.reduce((prev: any, current: any) =>
          new Date(prev.release_date) > new Date(current.release_date)
            ? prev
            : current,
        )
      : null;
  const displayCertification = relevantRelease
    ? `${relevantRelease.certification}`
    : "Not Rated";

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-100"
      style={{ opacity: style.opacity, visibility: style.visibility }}
    >
      <div
        ref={modalRef}
        className="rounded-xl mx-4 min-w-[73em] overflow-x-hidden bg-modal-background flex flex-col justify-center items-center transition-opacity duration-100 sm:max-w-xl sm:w-auto sm:h-auto overflow-y-70 p-4"
        style={{ opacity: style.opacity, height: "auto" }}
      >
        <div className="aspect-w-16 aspect-h-9 w-full sm:w-auto rounded-xl">
          {data?.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/original/${data.backdrop_path}`}
              alt={media.poster ? "" : "failed to fetch :("}
              className="rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <Skeleton />
          )}
          <div className="flex pt-3 items-center gap-4">
            <h1 className="relative text-xl sm:text-2xl whitespace-normal font-bold text-white">
              {data?.title || data?.name ? (
                data?.title || data?.name
              ) : (
                <Skeleton />
              )}
            </h1>
            <div className="font-semibold">
              {media.type === "movie" ? (
                displayCertification ? (
                  <div className="px-2 py-1 bg-search-background rounded">
                    <span>{displayCertification}</span>
                  </div>
                ) : (
                  <Skeleton />
                )
              ) : (
                <div className="px-2 py-1 bg-search-background rounded">
                  <span>
                    {(() => {
                      const releaseInfo = mediaInfo?.results?.find(
                        (result: any) => result.iso_3166_1 === "US",
                      );
                      return releaseInfo && releaseInfo.rating
                        ? releaseInfo.rating
                        : "NR";
                    })()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-row gap-2 font-bold">
              {media.type === "movie" ? (
                data?.runtime ? (
                  formatRuntime(data.runtime)
                ) : (
                  <Skeleton />
                )
              ) : null}
              <div>
                {media.type === "movie" ? (
                  data?.release_date ? (
                    String(data.release_date).split("-")[0]
                  ) : (
                    <Skeleton />
                  )
                ) : media.type === "show" ? (
                  data?.first_air_date ? (
                    String(data.first_air_date).split("-")[0]
                  ) : (
                    <Skeleton />
                  )
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-3 pb-3 pt-2">
            <div className="flex items-center space-x-[2px] font-semibold">
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index}>
                  {index < Math.round(Number(data?.vote_average) / 2) ? (
                    <Icon icon={Icons.STAR} />
                  ) : (
                    <Icon icon={Icons.STAR_BORDER} />
                  )}
                </span>
              ))}
            </div>
            <div className="flex flex-row gap-3 flex-wrap">
              {data?.genres && data.genres.length > 0
                ? data.genres.map((genre: { name: string }) => (
                    <div key={genre.name}>
                      <div className="px-2 py-1 text-[0.95em] bg-mediaCard-hoverBackground rounded hover:bg-search-background cursor-default duration-200 transition-colors transform hover:scale-110">
                        {genre.name}
                      </div>
                    </div>
                  ))
                : Array.from({ length: 3 }).map((_, idx) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={idx}>
                      <Skeleton />
                    </div>
                  ))}
            </div>
          </div>
          <div className="relative whitespace-normal font-medium overflow-y-auto max-h-28">
            {data?.overview}
          </div>
          <div className="pt-3">
            {isTVShow ? (
              <EpisodeSelector tmdbId={media.id} mediaTitle={media.title} />
            ) : null}
          </div>
          <div className="flex justify-center items-center mt-3 mb-1">
            <Button
              theme="purple"
              onClick={() =>
                navigate(
                  `/media/tmdb-${isTVShow ? "tv" : "movie"}-${media.id}-${media.title}`,
                )
              }
              className="text-xl sm:text-2xl font-bold hover:bg-purple-700 transition-all duration-[0.3s] hover:scale-105"
            >
              <div className="flex flex-row gap-2 items-center">
                <Icon icon={Icons.PLAY} />
                Watch
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
