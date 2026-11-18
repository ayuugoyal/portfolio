"use client";

import type React from "react";

import Image from "next/image";
import {
    Component,
    type ComponentType,
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion, useWebGL } from "./use-webgl";

/** What a lazily loaded scene receives: whether it is on screen (pause when not) and a ready callback. */
export type SceneProps = { inView: boolean; onReady: () => void };
type SceneModule = { default: ComponentType<SceneProps> };

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(err: unknown) {
        console.warn("[scene] falling back to poster:", err);
    }
    render() {
        return this.state.failed ? this.props.fallback : this.props.children;
    }
}

/**
 * A box that reserves its space (no layout shift), shows a poster, and loads a three.js scene
 * only when it comes near the viewport and the browser is idle. Falls back to the poster when
 * WebGL is missing, the scene throws, or the visitor prefers reduced motion (with a "show 3D" button).
 * Sets data-scene="ready" once the scene has drawn its first frame.
 */
export function LazyScene({
    load,
    aspect = "4 / 3",
    poster,
    posterAlt,
    className,
    children,
}: {
    load: () => Promise<SceneModule>;
    aspect?: string;
    poster?: string;
    posterAlt: string;
    className?: string;
    /** overlay content (HUD, labels) drawn above the canvas or poster */
    children?: ReactNode;
}) {
    const box = useRef<HTMLDivElement>(null);
    const webgl = useWebGL();
    const reduced = useReducedMotion();
    const [optIn, setOptIn] = useState(false);
    const [near, setNear] = useState(false);
    const [inView, setInView] = useState(false);
    const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const el = box.current;
        if (!el) return;
        const nearObs = new IntersectionObserver(
            ([e]) => e.isIntersecting && setNear(true),
            { rootMargin: "200px" }
        );
        const viewObs = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
        nearObs.observe(el);
        viewObs.observe(el);
        return () => {
            nearObs.disconnect();
            viewObs.disconnect();
        };
    }, []);

    const wanted = webgl === true && near && (!reduced || optIn) && !failed;

    useEffect(() => {
        if (!wanted || Scene) return;
        let cancelled = false;
        const start = () =>
            load()
                .then((m) => !cancelled && setScene(() => m.default))
                .catch((err) => {
                    console.warn("[scene] chunk failed:", err);
                    if (!cancelled) setFailed(true);
                });
        const w = window as Window & {
            requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        };
        if (w.requestIdleCallback) {
            const id = w.requestIdleCallback(start, { timeout: 1500 });
            return () => {
                cancelled = true;
                w.cancelIdleCallback?.(id);
            };
        }
        const t = setTimeout(start, 200);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [wanted, Scene, load]);

    const onReady = useCallback(() => setReady(true), []);

    const posterEl = poster ? (
        <Image
            src={poster}
            alt={posterAlt}
            fill
            sizes="(max-width: 640px) 100vw, 672px"
            className={cn(
                "object-contain transition-opacity duration-500",
                ready ? "opacity-0" : "opacity-100"
            )}
        />
    ) : null;

    return (
        <div
            ref={box}
            data-scene={ready ? "ready" : "loading"}
            // a parent can override the shape with --scene-aspect-override (e.g. a shorter hero on wide screens)
            className={cn("relative w-full overflow-hidden [aspect-ratio:var(--scene-aspect-override,var(--scene-aspect))]", className)}
            style={{ "--scene-aspect": aspect } as React.CSSProperties}
        >
            {posterEl}
            {Scene && wanted && (
                <SceneBoundary fallback={null}>
                    <div className="absolute inset-0">
                        <Scene inView={inView} onReady={onReady} />
                    </div>
                </SceneBoundary>
            )}
            {reduced && !optIn && webgl && (
                <button
                    type="button"
                    onClick={() => setOptIn(true)}
                    className="btn-quiet absolute bottom-3 right-3 bg-background/80"
                >
                    show 3d
                </button>
            )}
            {children}
        </div>
    );
}
