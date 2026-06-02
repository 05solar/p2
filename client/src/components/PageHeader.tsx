import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './icons';
import './PageHeader.css';

export function PageHeader({
  title,
  sub,
  back,
  onBack,
  right,
}: {
  title: string;
  sub?: string;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  const handleBack = () => (onBack ? onBack() : navigate(-1));
  return (
    <header className="page-header">
      {back && (
        <button className="page-back" onClick={handleBack} aria-label="뒤로">
          {Icon.back('var(--ink)', 22)}
        </button>
      )}
      <div className="page-headings">
        {sub && <div className="page-sub">{sub}</div>}
        <h1 className="page-title">{title}</h1>
      </div>
      {right && <div className="page-right">{right}</div>}
    </header>
  );
}
