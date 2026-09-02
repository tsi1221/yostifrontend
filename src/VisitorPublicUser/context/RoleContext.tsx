import  {
  createContext,
  useContext,
  useState,
 type ReactNode,
} from "react";

// --------------------------------------
// Role Type
// --------------------------------------
export type Role = "admin" | "finance" | "logistics" | "inspector";

// --------------------------------------
// Context Shape
// --------------------------------------
interface RoleContextType {
  role: Role;
  setRole: (value: Role) => void;
}

// --------------------------------------
// Create Context
// --------------------------------------
const RoleContext = createContext<RoleContextType | undefined>(undefined);

// --------------------------------------
// Custom Hook
// --------------------------------------
export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used inside <RoleProvider>");
  }
  return ctx;
};

// --------------------------------------
// Provider
// --------------------------------------
interface ProviderProps {
  children: ReactNode;
  initialRole?: Role;
}

export const RoleProvider: React.FC<ProviderProps> = ({
  children,
  initialRole = "admin",
}) => {
  const [role, setRole] = useState<Role>(initialRole);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};
