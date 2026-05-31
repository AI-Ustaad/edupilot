export interface MenuItem {
  labelKey: string;
  icon: string;
  path?: string;
  permission?: Permission;
  allowedRoles?: string[];
  featureFlag?: string;        // <-- add this
  children?: MenuItem[];
}

export interface MenuGroup {
  labelKey: string;
  icon: string;
  permission?: Permission;
  allowedRoles?: string[];
  featureFlag?: string;        // <-- add this
  children: MenuItem[];
}
