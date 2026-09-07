{{/* Expand the name of the chart. */}}
{{- define "mqtt-explorer.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Create a default fully qualified application name. */}}
{{- define "mqtt-explorer.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/* Namespace for all chart resources. */}}
{{- define "mqtt-explorer.namespace" -}}
{{- default .Release.Namespace .Values.namespaceOverride }}
{{- end }}

{{/* Create chart name and version as used by the chart label. */}}
{{- define "mqtt-explorer.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Common labels. */}}
{{- define "mqtt-explorer.labels" -}}
helm.sh/chart: {{ include "mqtt-explorer.chart" . }}
{{ include "mqtt-explorer.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/* Selector labels. */}}
{{- define "mqtt-explorer.selectorLabels" -}}
app: {{ include "mqtt-explorer.name" . }}
app.kubernetes.io/name: {{ include "mqtt-explorer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Secret name for secretEnv values. */}}
{{- define "mqtt-explorer.secretName" -}}
{{- printf "%s-env" (include "mqtt-explorer.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* PVC name for application data. */}}
{{- define "mqtt-explorer.pvcName" -}}
{{- printf "%s-data" (include "mqtt-explorer.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}
