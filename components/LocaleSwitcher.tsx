import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';
import { GB, VN } from 'country-flag-icons/react/3x2'
export const LocaleSwitcher = ({ position = "bottom" }: { position: "bottom" | "top" }) => {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      position={position}
      items={[
        {
          value: 'en',
          label: t('en'),
          icon: <GB title="England" className="h-4"/>
        },
        {
          value: 'vi',
          label: t('vi'),
          icon: <VN title="Việt Nam" className="h-4"/>
        }
      ]}
    // label={t('label')}
    />
  );
}
