'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, mergeImageUrl } from '@/lib/utils';
import { uploadFile } from '@/services/media-api';
import type { InviteEffect } from '@/types/invite-effect';

type Theme = Record<string, unknown>;
type Choice = 'follow' | 'on' | 'off';

/** Theme keys this panel manages; "reset" clears exactly these from the event overrides. */
export const EVENT_EFFECT_KEYS = ['musicEnabled', 'musicUrl', 'autoScroll', 'autoScrollSpeed'];

/** Same rule as `isEffectEnabled` in @eventlab/effects: default-on effects only turn off on an explicit false. */
function resolveFlag(value: unknown, defaultEnabled: boolean): boolean {
  return defaultEnabled ? value !== false : value === true;
}

function choiceOf(overrides: Theme, key: string): Choice {
  if (overrides[key] === true) return 'on';
  if (overrides[key] === false) return 'off';
  return 'follow';
}

function withChoice(overrides: Theme, key: string, choice: Choice): Theme {
  const next = { ...overrides };
  if (choice === 'follow') delete next[key];
  else next[key] = choice === 'on';
  return next;
}

function TriState({
  value,
  templateOn,
  onChange,
}: {
  value: Choice;
  templateOn: boolean;
  onChange: (choice: Choice) => void;
}) {
  const t = useTranslations('EventPage.effects');
  const options: Array<{ id: Choice; label: string }> = [
    { id: 'follow', label: `${t('follow')} · ${templateOn ? t('on') : t('off')}` },
    { id: 'on', label: t('on') },
    { id: 'off', label: t('off') },
  ];
  return (
    <div className="inline-flex shrink-0 rounded-lg border border-stone-200 bg-stone-50 p-0.5" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            value === option.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800',
            value === option.id && option.id === 'on' && 'text-emerald-700',
            value === option.id && option.id === 'off' && 'text-rose-700',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Per-event effect and music switches. `overrides` holds only what this event changes; anything
 * left on "follow" keeps tracking the template, so later template edits still reach this event.
 */
export default function EventEffectsPanel({
  catalog,
  templateTheme,
  overrides,
  onChange,
}: {
  catalog: InviteEffect[];
  templateTheme: Theme;
  overrides: Theme;
  onChange: (next: Theme) => void;
}) {
  const t = useTranslations('EventPage.effects');
  const musicInputRef = useRef<HTMLInputElement>(null);

  const fallback: Array<Pick<InviteEffect, 'slug' | 'themeKey' | 'name' | 'kind' | 'defaultEnabled'>> = [
    { slug: 'envelope', themeKey: 'effectEnvelope', name: t('fallback.envelope'), kind: 'gate', defaultEnabled: true },
    { slug: 'confetti', themeKey: 'effectConfetti', name: t('fallback.confetti'), kind: 'burst', defaultEnabled: true },
    { slug: 'petals', themeKey: 'effectPetals', name: t('fallback.petals'), kind: 'ambient', defaultEnabled: true },
    { slug: 'hearts', themeKey: 'effectHearts', name: t('fallback.hearts'), kind: 'ambient', defaultEnabled: true },
    { slug: 'music', themeKey: 'musicEnabled', name: t('music'), kind: 'audio', defaultEnabled: true },
    { slug: 'auto-scroll', themeKey: 'autoScroll', name: t('autoScroll'), kind: 'scroll', defaultEnabled: false },
  ];
  const effects = catalog.length ? catalog : fallback;
  const visual = effects.filter((e) => e.kind === 'burst' || e.kind === 'ambient' || e.kind === 'gate');
  const music = effects.find((e) => e.slug === 'music');
  const scroll = effects.find((e) => e.slug === 'auto-scroll');

  const merged = { ...templateTheme, ...overrides };
  const managedKeys = [...EVENT_EFFECT_KEYS, ...effects.map((e) => e.themeKey)];
  const hasOverrides = managedKeys.some((key) => key in overrides);

  const set = (key: string, value: unknown) => {
    const next = { ...overrides };
    if (value === undefined || value === '') delete next[key];
    else next[key] = value;
    onChange(next);
  };

  const reset = () => {
    const next = { ...overrides };
    managedKeys.forEach((key) => delete next[key]);
    onChange(next);
  };

  const musicOn = music ? resolveFlag(merged[music.themeKey], music.defaultEnabled) : false;
  const ownMusicUrl = typeof overrides.musicUrl === 'string' ? overrides.musicUrl : '';
  const templateMusicUrl = typeof templateTheme.musicUrl === 'string' ? templateTheme.musicUrl : '';
  const effectiveMusicUrl = ownMusicUrl || templateMusicUrl;
  const scrollOn = scroll ? resolveFlag(merged[scroll.themeKey], scroll.defaultEnabled) : false;

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label className="text-base font-semibold text-stone-800">{t('title')}</Label>
          <p className="mt-1 text-sm text-stone-500">{t('hint')}</p>
        </div>
        {hasOverrides ? (
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t('reset')}
          </Button>
        ) : null}
      </div>

      <div className="divide-y divide-stone-100">
        {visual.map((effect) => (
          <div key={effect.slug} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <div className="text-sm font-medium text-stone-800">{effect.name}</div>
              {'description' in effect && effect.description ? (
                <p className="text-xs text-stone-500">{String(effect.description)}</p>
              ) : null}
            </div>
            <TriState
              value={choiceOf(overrides, effect.themeKey)}
              templateOn={resolveFlag(templateTheme[effect.themeKey], effect.defaultEnabled)}
              onChange={(choice) => onChange(withChoice(overrides, effect.themeKey, choice))}
            />
          </div>
        ))}
      </div>

      {music ? (
        <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-stone-800">{music.name}</div>
            <TriState
              value={choiceOf(overrides, music.themeKey)}
              templateOn={resolveFlag(templateTheme[music.themeKey], music.defaultEnabled)}
              onChange={(choice) => onChange(withChoice(overrides, music.themeKey, choice))}
            />
          </div>
          {musicOn ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={musicInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/aac,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    try {
                      toast.info(t('musicUploading'), { id: 'event-music' });
                      const uploaded = await uploadFile(file);
                      set('musicUrl', uploaded.url || uploaded.publicRelativePath || '');
                      toast.success(t('musicUploaded'), { id: 'event-music' });
                    } catch {
                      toast.error(t('musicUploadError'), { id: 'event-music' });
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => musicInputRef.current?.click()}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {t('musicUpload')}
                </Button>
                {ownMusicUrl ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => set('musicUrl', undefined)}>
                    {t('musicUseTemplate')}
                  </Button>
                ) : null}
              </div>
              <Input
                value={ownMusicUrl}
                placeholder={templateMusicUrl || 'https://.../song.mp3'}
                onChange={(e) => set('musicUrl', e.target.value.trim())}
              />
              <p className="text-xs text-stone-500">
                {ownMusicUrl ? t('musicOwn') : templateMusicUrl ? t('musicFromTemplate') : t('musicNone')}
              </p>
              {effectiveMusicUrl ? <audio className="w-full" controls src={mergeImageUrl(effectiveMusicUrl)} /> : null}
            </>
          ) : null}
        </div>
      ) : null}

      {scroll ? (
        <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-medium text-stone-800">{scroll.name}</div>
            <TriState
              value={choiceOf(overrides, scroll.themeKey)}
              templateOn={resolveFlag(templateTheme[scroll.themeKey], scroll.defaultEnabled)}
              onChange={(choice) => onChange(withChoice(overrides, scroll.themeKey, choice))}
            />
          </div>
          {scrollOn ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-500">{t('autoScrollSpeed')}</span>
              {(['slow', 'normal', 'fast'] as const).map((speed) => {
                const current = (merged.autoScrollSpeed as string) || 'normal';
                return (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => set('autoScrollSpeed', speed === templateTheme.autoScrollSpeed ? undefined : speed)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs',
                      current === speed ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600',
                    )}
                  >
                    {t(`speeds.${speed}`)}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
