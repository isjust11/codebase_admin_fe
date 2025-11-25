"use client";
import React, { useEffect, useRef, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  ChevronDownIcon,
  HorizontaLDots,
} from "@/public/icons/index";
import SidebarWidget from "./SidebarWidget";
import { useAuth } from "@/contexts/AuthContext";
import { Feature } from "@/types/feature";
import { Icon } from "@/components/ui/icon";
import { Category } from "@/types/category";
import { getCategoryByCode } from "@/services/manager-api";
import { AppCategoryCode, AppConstants, AppRoutes } from "@/constants";
import { buildFeature } from "@/lib/utils";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { Loader2 } from "lucide-react";
import { useLoading } from "@/contexts/LoadingContext";
import { SITE } from '@/config/config'
type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  type?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { user, feature } = useAuth();
  const { isLoading, navigateTo } = useLoading();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [menuTypes, setMenuTypes] = useState<Category[]>();
  const [features, setFeatures] = useState<Feature[]>();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: string;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);


  useAsyncEffect(async () => {
    if (typeof window === "undefined") {
      return;
    }
    let isMounted = true;

    const fetchMenuTypes = async () => {
      try {
        const appCode = Object.entries(AppCategoryCode);
        const CACHE_KEY = `sidebar_menu_types_${appCode[0][0]}`;
        const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

        // If flagged as loaded, still attempt to hydrate from cache
        const isLoadSidebar = localStorage.getItem(AppConstants.IsLoadSidebar);
        if (isLoadSidebar) {
          const cachedHydrate = localStorage.getItem(CACHE_KEY);
          if (cachedHydrate) {
            try {
              const cached = JSON.parse(cachedHydrate) as { data: Category[]; ts: number };
              if (cached && Array.isArray(cached.data)) {
                if (!isMounted) return;
                setMenuTypes(cached.data.sort((a, b) => a.sortOrder - b.sortOrder));
                setIsDataLoading(false);
                return;
              }
            } catch (_e) { }
          }
        }

        // Try fresh cache first
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw) as { data: Category[]; ts: number };
            if (cached && Array.isArray(cached.data) && cached.ts && Date.now() - cached.ts < CACHE_TTL_MS) {
              if (!isMounted) return;
              setMenuTypes(cached.data.sort((a, b) => a.sortOrder - b.sortOrder));
              setIsDataLoading(false);
              localStorage.setItem(AppConstants.IsLoadSidebar, 'true');
              return; // cache hit, skip network
            }
          } catch (_e) {
            // ignore cache parse errors
          }
        }

        // Fallback to network
        const data: Category[] = await getCategoryByCode(appCode[0][0]);
        if (!data || !isMounted) {
          return;
        }
        const sorted = data.sort((a, b) => a.sortOrder - b.sortOrder);
        setMenuTypes(sorted);
        // write cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sorted, ts: Date.now() }));
        } catch (_e) {
          // ignore quota errors
        }
        localStorage.setItem(AppConstants.IsLoadSidebar, 'true');
      } catch (error) {
        console.error('Error fetching menu types:', error);
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    };

    fetchMenuTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (features && features.length > 0) {
      return;
    }
    const buildFeatureItems = buildFeature(feature);
    setFeatures(buildFeatureItems);
  }, [feature]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    // Chỉ chạy khi có đủ dữ liệu
    if (!menuTypes || !features || menuTypes.length === 0 || features.length === 0) {
      return;
    }

    let submenuMatched = false;

    // Lặp qua từng menu type
    menuTypes.forEach((menuType) => {
      // Lọc features theo menu type
      const items = features
        .map(convertFeatureToNavItem)
        .filter((x) => x.type === menuType.code);


      items.forEach((nav, index) => {
        if (nav.subItems && nav.subItems.length > 0) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType.code,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // Chỉ đóng submenu nếu không tìm thấy match và có submenu đang mở
    if (!submenuMatched) {
      console.log('No submenu matched, closing current submenu');
      setOpenSubmenu(null);
    }
  }, [pathname, menuTypes, features, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const convertFeatureToNavItem = (feature: Feature): NavItem => {
    return {
      name: feature.label || '',
      icon: <Icon name={feature.icon} size={feature.iconSize} />, // You'll need to implement this
      path: feature.link,
      type: feature?.featureType?.code,
      subItems: feature.children?.map(child => ({
        name: child.label || '',
        path: child.link || '',
        pro: false,
        new: false
      }))
    };
  };

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2  border-s-fuchsia-600"></div>
      </div>
    );
  }

  const renderMenuItems = (
    navItems: NavItem[],
    menuTypeCode: string
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems && nav.subItems.length > 0 ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuTypeCode)}
              className={`menu-item group  ${openSubmenu?.type === menuTypeCode && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuTypeCode && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuTypeCode &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-fuchsia-600"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <div
                onClick={() => {
                  if (nav.path) {
                    navigateTo(nav.path as string);
                  }
                }}
                className={`menu-item group cursor-default ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </div>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuTypeCode}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuTypeCode && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuTypeCode}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <div
                      onClick={() => {
                        if (subItem.path) {
                          const path = subItem.path as string;
                          setCurrentPath(path);
                          navigateTo(path);
                        }
                      }}
                      className={`menu-dropdown-item cursor-default ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      <span>{subItem.name}</span>
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                      {isLoading(subItem.path as string) && <Loader2 className="h-4 w-4 animate-spin text-fuchsia-600" />}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const handleSubmenuToggle = (index: number, menuTypeCode: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuTypeCode &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuTypeCode, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`p-4 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href={AppRoutes.Home}>
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src={SITE.logo}
                alt="Logo"
                width={120}
                height={30}
              />
              <Image
                className="hidden dark:block"
                src={SITE.logo}
                alt="Logo"
                width={120}
                height={30}
              />
            </>
          ) : (
            <Image
              src={SITE.icon}
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {menuTypes?.map((type) => (
              <div key={type.code}>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    type.name
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(features?.map(convertFeatureToNavItem).filter((x) => x.type == type.code) ?? [], type.code)}
              </div>
            ))

            }
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
